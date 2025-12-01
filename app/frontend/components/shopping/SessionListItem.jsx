import { useState } from 'react'
import PropTypes from 'prop-types'
import { formatTimeAgo } from '../../utils/dateUtils'
import { MoreVert, Trash } from 'iconoir-react'

export default function SessionListItem({ session, onDelete, onEdit, isLast }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = session.active

  const handleDelete = (e) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    onDelete(session.id)
  }

  const handleEdit = () => {
    onEdit(session)
  }

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="flex gap-3 relative">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center pt-1">
        <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'bg-primary border-primary' : 'bg-base-100 border-base-300'} z-10`}></div>
        {!isLast && <div className="w-0.5 flex-1 bg-base-300 mt-1"></div>}
      </div>

      {/* Content Card */}
      <div className="flex-1 pb-6">
        <div className="relative bg-base-200 hover:bg-base-300 active:bg-base-300/70 rounded-lg transition-colors">
          <button
            onClick={handleEdit}
            className="w-full text-left p-3 pr-12 cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              {/* Session Badge */}
              {isActive && (
                <div className="badge badge-primary badge-sm mb-2">
                  ACTIVE
                </div>
              )}

              {/* Session Name */}
              <h3 className="font-medium text-base text-base-content truncate mb-1">
                {session.name}
              </h3>

              {/* Session Metadata */}
              <div className="text-xs text-base-content/60">
                {formatTimeAgo(session.created_at)}
              </div>
            </div>
          </button>

          {/* 3-dot menu (only for inactive sessions) */}
          {!isActive && (
            <div className="absolute top-2 right-2">
              <button
                onClick={handleMenuToggle}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Session menu"
              >
                <MoreVert width="20px" height="20px" strokeWidth={2} />
              </button>
              {isMenuOpen && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.stopPropagation()
                        setIsMenuOpen(false)
                      }
                    }}
                    role="button"
                    tabIndex={-1}
                    aria-label="Close menu"
                  ></div>
                  {/* Menu */}
                  <ul className="absolute right-0 top-full mt-1 menu bg-base-100 rounded-box w-36 p-2 shadow-lg border border-base-300 z-50">
                    <li>
                      <button
                        onClick={handleDelete}
                        className="text-sm text-error gap-2"
                      >
                        <Trash width="16px" height="16px" strokeWidth={2} />
                        Delete
                      </button>
                    </li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

SessionListItem.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    active: PropTypes.bool,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  isLast: PropTypes.bool,
}

SessionListItem.defaultProps = {
  isLast: false,
}
