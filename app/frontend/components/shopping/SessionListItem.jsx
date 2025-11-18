import { useState } from 'react'
import { formatTimeAgo } from '../../utils/dateUtils'

export default function SessionListItem({ session, onDelete, onViewDetails }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Calculate session statistics
  const getSessionStats = (session) => {
    // TODO: This will need actual item data from the API
    // For now, showing placeholder
    return {
      itemCount: session.item_count || 0,
      duration: session.duration || 'N/A',
    }
  }

  const stats = getSessionStats(session)
  const isActive = session.active

  const handleDelete = () => {
    setIsMenuOpen(false)
    onDelete(session.id)
  }

  const handleViewDetails = () => {
    setIsMenuOpen(false)
    onViewDetails(session.id)
  }

  return (
    <div
      className={`card border ${
        isActive
          ? 'border-primary bg-primary/10'
          : 'border-base-300 bg-base-100 hover:bg-base-200'
      } transition-colors`}
    >
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Session Badge */}
            {isActive && (
              <div className="badge badge-primary mb-2">
                SHOPPING NOW
              </div>
            )}

            {/* Session Name */}
            <h3 className="card-title text-xl mb-2">
              {session.name}
            </h3>

            {/* Session Metadata */}
            <div className="flex gap-4 text-sm text-base-content/70 mb-3">
              <span>Created {formatTimeAgo(session.created_at)}</span>
              {!isActive && session.finished_at && (
                <span>• Finished {formatTimeAgo(session.finished_at)}</span>
              )}
            </div>

            {/* Session Stats */}
            <div className="flex gap-4 text-sm text-base-content">
              <span>
                <strong>{stats.itemCount}</strong> items
              </span>
              {stats.duration !== 'N/A' && (
                <span>
                  • Duration: <strong>{stats.duration}</strong>
                </span>
              )}
            </div>

            {/* TODO: Add item list preview */}
            {/* <div className="mt-3 text-sm text-base-content/70">
              Items: milk, eggs, bread...
            </div> */}
          </div>

          {/* Actions Menu */}
          <div className="dropdown dropdown-end shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Session menu"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {isMenuOpen && (
              <ul className="dropdown-content menu bg-base-100 rounded-box w-36 p-2 shadow-lg border border-base-300">
                <li>
                  <button
                    onClick={handleViewDetails}
                    className="text-sm"
                  >
                    View Details
                  </button>
                </li>
                {!isActive && (
                  <li>
                    <button
                      onClick={handleDelete}
                      className="text-sm text-error"
                    >
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
