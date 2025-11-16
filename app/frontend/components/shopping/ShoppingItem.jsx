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
  isFirstInGroup,
  isLastInGroup,
  isLoading,
  isTransitioningOut,
  isTransitioningIn,
}) {
  const baseClasses = 'flex items-center gap-3 transition-colors'
  const paddingClasses = isChecked ? 'p-2' : 'p-3'
  const hoverClasses = isLoading ? '' : 'hover:bg-gray-50'
  const borderClasses = !isLastInGroup ? 'border-b border-gray-200' : ''
  const roundingClasses = `${isFirstInGroup ? 'rounded-t-lg' : ''} ${isLastInGroup ? 'rounded-b-lg' : ''}`
  const opacityClasses = isChecked ? 'opacity-70' : ''
  const loadingClasses = isLoading ? 'item-loading pointer-events-none' : ''
  const transitionOutClasses = isTransitioningOut ? 'item-transition-out' : ''
  const transitionInClasses = isTransitioningIn ? 'item-transition-in' : ''

  return (
    <div
      className={`${baseClasses} ${paddingClasses} ${hoverClasses} ${borderClasses} ${roundingClasses} ${opacityClasses} ${loadingClasses} ${transitionOutClasses} ${transitionInClasses}`}
    >
      {showCheckbox && (
        <>
          {isLoading ? (
            <div className="shrink-0">
              <svg
                className={`${isChecked ? 'w-4 h-4' : 'w-5 h-5'} animate-spin text-primary-600`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <input
              type="checkbox"
              checked={isChecked}
              onChange={onToggleCheck}
              className={`${isChecked ? 'w-4 h-4' : 'w-5 h-5'} rounded border-gray-300 cursor-pointer shrink-0`}
            />
          )}
        </>
      )}

      <div className="flex-1 min-w-0">
        <div className={`${isChecked ? 'text-sm text-gray-600 line-through truncate' : 'font-semibold text-gray-900'}`}>
          {item.name}
        </div>

        {(item.category || item.description) && (
          <div className={`${isChecked ? 'text-xs text-gray-400' : 'text-sm text-gray-600 mt-0.5'} ${isChecked ? 'truncate' : ''}`}>
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
          <div className="text-sm text-gray-600 mt-0.5 italic">{item.notes}</div>
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
    </div>
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
  isFirstInGroup: PropTypes.bool,
  isLastInGroup: PropTypes.bool,
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
