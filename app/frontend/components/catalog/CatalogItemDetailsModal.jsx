import PropTypes from 'prop-types'
import { useItemShoppingSessions } from '../../hooks/queries/useCatalogQueries'
import { formatTimeAgo } from '../../utils/dateUtils'
import { Cart } from 'iconoir-react'

/**
 * Modal for viewing catalog item details and shopping history
 */
export default function CatalogItemDetailsModal({ isOpen, onClose, item }) {
  const { data: sessions = [], isLoading } = useItemShoppingSessions(item?.id)

  if (!isOpen || !item) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-1">{item.name}</h3>

        {item.description && (
          <p className="text-base-content/70 text-sm mb-4">{item.description}</p>
        )}

        {item.category && (
          <p className="text-base-content/50 text-xs mb-4">
            Category: {item.category.name}
          </p>
        )}

        <div className="divider my-2"></div>

        <div className="mb-4">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Cart width="16px" height="16px" strokeWidth={2} />
            Shopping History
          </h4>

          {isLoading ? (
            <p className="text-base-content/50 text-sm">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-base-content/50 text-sm">
              You haven&apos;t picked this up yet. Add it to your list!
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-base-content/60 text-xs mb-2">
                You&apos;ve grabbed this {sessions.length} {sessions.length === 1 ? 'time' : 'times'}:
              </p>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {sessions.map((session) => (
                  <li key={session.id} className="text-sm flex justify-between items-center py-1">
                    <span className="text-base-content/80 truncate">{session.name}</span>
                    <span className="text-base-content/50 text-xs whitespace-nowrap ml-2">
                      {formatTimeAgo(session.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>
        </div>
      </div>
      <div
        className="modal-backdrop"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      ></div>
    </div>
  )
}

CatalogItemDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  }),
}
