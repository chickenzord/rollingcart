import PropTypes from 'prop-types'

/**
 * Three-dot menu dropdown for shopping items
 * Displays Edit and Delete options
 */
export default function ItemMenu({ isOpen, onToggle, onEdit, onDelete }) {
  return (
    <div className="relative shrink-0">
      <button
        onClick={onToggle}
        className="p-2 hover:bg-gray-100 rounded transition-colors relative z-0"
        aria-label="Item menu"
      >
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            onClick={onEdit}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-900"
          >
            Edit Notes
          </button>
          <button
            onClick={onDelete}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-error-600 text-sm"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

ItemMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}
