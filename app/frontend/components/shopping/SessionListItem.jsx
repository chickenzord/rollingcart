import { useState } from 'react'
import { formatTimeAgo } from '../../utils/dateUtils'
import { EditPencil, Trash } from 'iconoir-react'

export default function SessionListItem({ session, onDelete, onEdit }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = session.active

  const handleDelete = () => {
    setIsMenuOpen(false)
    onDelete(session.id)
  }

  const handleEdit = () => {
    setIsMenuOpen(false)
    onEdit(session)
  }

  return (
    <div className="flex gap-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary' : 'bg-base-300'}`}></div>
        <div className="w-0.5 flex-1 bg-base-300"></div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 cursor-pointer" onClick={handleEdit}>
            {/* Session Badge */}
            {isActive && (
              <div className="badge badge-primary badge-sm mb-1">
                SHOPPING NOW
              </div>
            )}

            {/* Session Name */}
            <h3 className="font-medium text-base mb-1">
              {session.name}
            </h3>

            {/* Session Metadata */}
            <div className="text-xs text-base-content/50">
              {formatTimeAgo(session.created_at)}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="dropdown dropdown-end shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Session menu"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {isMenuOpen && (
              <ul className="dropdown-content menu bg-base-100 rounded-box w-36 p-2 shadow-lg border border-base-300 z-50">
                <li>
                  <button
                    onClick={handleEdit}
                    className="text-sm gap-2"
                  >
                    <EditPencil width="14px" height="14px" strokeWidth={2} />
                    Edit
                  </button>
                </li>
                {!isActive && (
                  <li>
                    <button
                      onClick={handleDelete}
                      className="text-sm text-error gap-2"
                    >
                      <Trash width="14px" height="14px" strokeWidth={2} />
                      Delete
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
