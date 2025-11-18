import PropTypes from 'prop-types'
import ItemMenu from './ItemMenu'

/**
 * Shopping item card with checkbox, name, category, description, and menu
 * Supports both unchecked (default) and checked (completed) states
 */
export default function ShoppingItem({
  item,
  isChecked,
  showCheckbox,
  onToggleCheck,
  onDelete,
  showCategoryLabel,
  openMenuId,
  onMenuToggle,
  isLoading,
  isTransitioningOut,
  isTransitioningIn,
}) {
  const paddingClasses = isChecked ? 'p-2' : 'p-3'
  const opacityClasses = isChecked ? 'ghost' : ''
  const loadingClasses = isLoading ? 'item-loading pointer-events-none' : ''
  const transitionOutClasses = isTransitioningOut ? 'item-transition-out' : ''
  const transitionInClasses = isTransitioningIn ? 'item-transition-in' : ''

  return (
    <li
      className={`flex items-center gap-3 transition-colors ${paddingClasses} ${opacityClasses} ${loadingClasses} ${transitionOutClasses} ${transitionInClasses}`}
    >
      {showCheckbox && (
        <>
          {isLoading ? (
            <div className="shrink-0">
              <span className={`loading loading-spinner ${isChecked ? 'loading-xs' : 'loading-sm'} text-primary`}></span>
            </div>
          ) : (
            <input
              type="checkbox"
              checked={isChecked}
              onChange={onToggleCheck}
              className={`checkbox ${isChecked ? 'checkbox-xs' : 'checkbox-sm'} checkbox-primary shrink-0`}
            />
          )}
        </>
      )}

      <div className="flex-1 min-w-0">
        <div className={`${isChecked ? 'text-sm text-base-content/60 line-through truncate' : 'font-semibold text-base-content'}`}>
          {item.name}
        </div>

        {(item.category || item.description) && (
          <div className={`${isChecked ? 'text-xs text-base-content/40' : 'text-sm text-base-content/70 mt-0.5'} ${isChecked ? 'truncate' : ''}`}>
            {showCategoryLabel ? (
              // Show description only if category grouping is active
              item.description
            ) : (
              // Show both category and description if not grouped
              <>
                {item.category && item.category.name}
                {item.category && item.description && ' • '}
                {item.description}
              </>
            )}
          </div>
        )}

        {item.notes && !isChecked && (
          <div className="text-sm text-base-content/70 mt-0.5 italic">{item.notes}</div>
        )}
      </div>

      <ItemMenu
        isOpen={openMenuId === item.id}
        onToggle={() => onMenuToggle(item.id)}
        onEdit={() => {
          onMenuToggle(null)
          // TODO: Implement edit functionality
          alert('Edit functionality coming soon!')
        }}
        onDelete={() => {
          onMenuToggle(null)
          onDelete(item.id)
        }}
      />
    </li>
  )
}

ShoppingItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.shape({
      name: PropTypes.string,
    }),
    description: PropTypes.string,
    notes: PropTypes.string,
    created_at: PropTypes.string,
  }).isRequired,
  isChecked: PropTypes.bool,
  showCheckbox: PropTypes.bool,
  onToggleCheck: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  showCategoryLabel: PropTypes.bool,
  openMenuId: PropTypes.number,
  onMenuToggle: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isTransitioningOut: PropTypes.bool,
  isTransitioningIn: PropTypes.bool,
}

ShoppingItem.defaultProps = {
  isChecked: false,
  showCheckbox: false,
  onToggleCheck: null,
  showCategoryLabel: false,
  openMenuId: null,
  isFirstInGroup: false,
  isLastInGroup: false,
  isLoading: false,
  isTransitioningOut: false,
  isTransitioningIn: false,
}
