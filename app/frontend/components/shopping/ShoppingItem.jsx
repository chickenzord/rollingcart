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
  isNewItem,
  isFirstInGroup,
  isLastInGroup,
}) {
  const baseClasses = 'flex items-center gap-3 transition-colors'
  const paddingClasses = isChecked ? 'p-2' : 'p-3'
  const hoverClasses = 'hover:bg-gray-50'
  const borderClasses = !isLastInGroup ? 'border-b border-gray-200' : ''
  const roundingClasses = `${isFirstInGroup ? 'rounded-t-lg' : ''} ${isLastInGroup ? 'rounded-b-lg' : ''}`
  const glowClasses = isNewItem ? 'item-glow' : ''
  const opacityClasses = isChecked ? 'opacity-70' : ''

  return (
    <div
      className={`${baseClasses} ${paddingClasses} ${hoverClasses} ${borderClasses} ${roundingClasses} ${glowClasses} ${opacityClasses}`}
    >
      {showCheckbox && (
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggleCheck}
          className={`${isChecked ? 'w-4 h-4' : 'w-5 h-5'} rounded border-gray-300 cursor-pointer shrink-0`}
        />
      )}

      <div className="flex-1 min-w-0">
        <div className={`${isChecked ? 'text-sm text-gray-700 line-through truncate' : 'font-semibold text-gray-900'}`}>
          {item.name}
        </div>

        {(item.category || item.description) && (
          <div className={`${isChecked ? 'text-xs text-gray-400' : 'text-sm text-gray-500 mt-0.5'} ${isChecked ? 'truncate' : ''}`}>
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
          <div className="text-sm text-gray-700 mt-0.5 italic">{item.notes}</div>
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
  isNewItem: PropTypes.bool,
  isFirstInGroup: PropTypes.bool,
  isLastInGroup: PropTypes.bool,
}

ShoppingItem.defaultProps = {
  isChecked: false,
  showCheckbox: false,
  onToggleCheck: null,
  showCategoryLabel: false,
  openMenuId: null,
  isNewItem: false,
  isFirstInGroup: false,
  isLastInGroup: false,
}
