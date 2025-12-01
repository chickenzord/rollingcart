import PropTypes from 'prop-types'
import ItemMenu from './ItemMenu'

/**
 * Mobile-first shopping item with large touch targets
 * Simplified design for better mobile UX
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
}) {
  return (
    <li className={`flex items-center gap-3 py-3 bg-base-100 active:bg-base-200 transition-colors ${isChecked ? 'opacity-60' : ''}`}>
      {/* Checkbox - Large touch target */}
      {showCheckbox && (
        <label className="flex items-center justify-center shrink-0 cursor-pointer">
          {onToggleCheck ? (
            <input
              type="checkbox"
              checked={isChecked}
              onChange={onToggleCheck}
              className={`checkbox checkbox-primary cursor-pointer ${isChecked ? 'checkbox-sm' : 'checkbox-md'}`}
            />
          ) : (
            <div className="relative group">
              <input
                type="checkbox"
                checked={isChecked}
                disabled
                className="checkbox checkbox-md checkbox-primary opacity-30"
              />
              <div className="hidden group-active:block absolute -top-16 left-1/2 -translate-x-1/2 bg-base-300 text-base-content text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg z-50">
                Start a shopping trip to check off items
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-base-300"></div>
              </div>
            </div>
          )}
        </label>
      )}

      {/* Item Content */}
      <div className="flex-1 min-w-0">
        <div className={`${isChecked ? 'text-sm text-base-content/60 line-through' : 'text-base font-medium text-base-content'}`}>
          {item.name}
        </div>

        {(item.category || item.description) && !isChecked && (
          <div className="text-sm text-base-content/60 mt-1">
            {showCategoryLabel ? (
              item.description
            ) : (
              <>
                {item.category?.name}
                {item.category && item.description && ' • '}
                {item.description}
              </>
            )}
          </div>
        )}

        {item.notes && !isChecked && (
          <div className="text-sm text-base-content/60 mt-1 italic">{item.notes}</div>
        )}
      </div>

      {/* Menu - Large touch target */}
      <div className="shrink-0">
        <ItemMenu
          isOpen={openMenuId === item.id}
          onToggle={() => onMenuToggle(item.id)}
          onEdit={() => {
            onMenuToggle(null)
            alert('Edit functionality coming soon!')
          }}
          onDelete={() => {
            onMenuToggle(null)
            onDelete(item)
          }}
        />
      </div>
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
}

ShoppingItem.defaultProps = {
  isChecked: false,
  showCheckbox: false,
  onToggleCheck: null,
  showCategoryLabel: false,
  openMenuId: null,
}
