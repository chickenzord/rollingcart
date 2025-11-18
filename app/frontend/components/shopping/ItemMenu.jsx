import PropTypes from 'prop-types'

/**
 * Three-dot menu dropdown for shopping items
 * Displays Edit and Delete options
 */
export default function ItemMenu({ isOpen, onToggle, onEdit, onDelete }) {
  return (
    <div className="dropdown dropdown-end shrink-0">
      <button
        onClick={onToggle}
        className="btn btn-ghost btn-sm btn-circle"
        aria-label="Item menu"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {isOpen && (
        <ul className="dropdown-content menu bg-base-100 rounded-box w-36 p-2 shadow-lg border border-base-300">
          <li>
            <button
              onClick={onEdit}
              className="text-sm"
            >
              Edit Notes
            </button>
          </li>
          <li>
            <button
              onClick={onDelete}
              className="text-sm text-error"
            >
              Delete
            </button>
          </li>
        </ul>
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
