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
      className={`border rounded-lg p-5 ${
        isActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-white hover:bg-gray-50'
      } transition-colors`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Session Badge */}
          {isActive && (
            <div className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded mb-2">
              SHOPPING NOW
            </div>
          )}

          {/* Session Name */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {session.name}
          </h3>

          {/* Session Metadata */}
          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <span>Created {formatTimeAgo(session.created_at)}</span>
            {!isActive && session.finished_at && (
              <span>• Finished {formatTimeAgo(session.finished_at)}</span>
            )}
          </div>

          {/* Session Stats */}
          <div className="flex gap-4 text-sm">
            <span className="text-gray-700">
              <strong>{stats.itemCount}</strong> items
            </span>
            {stats.duration !== 'N/A' && (
              <span className="text-gray-700">
                • Duration: <strong>{stats.duration}</strong>
              </span>
            )}
          </div>

          {/* TODO: Add item list preview */}
          {/* <div className="mt-3 text-sm text-gray-600">
            Items: milk, eggs, bread...
          </div> */}
        </div>

        {/* Actions Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            aria-label="Session menu"
          >
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={handleViewDetails}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                View Details
              </button>
              {!isActive && (
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
