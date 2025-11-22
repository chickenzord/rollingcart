import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useShoppingItems } from '../../hooks/queries/useShoppingQueries'

/**
 * Modal for viewing shopping session details
 */
export default function SessionDetailsModal({ isOpen, onClose, session }) {
  const { data: items = [], isLoading } = useShoppingItems(
    session ? { forSession: session.id } : {},
  )

  if (!isOpen || !session) return null

  const isActive = session.active

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-2">{session.name}</h3>

        {isActive && (
          <div className="mb-4">
            <p className="text-sm text-base-content/70 mb-2">
              You&apos;re still on this trip! Head over to your list to check off items.
            </p>
            <Link to="/" className="link link-primary text-sm" onClick={onClose}>
              Go to Shopping List &rarr;
            </Link>
          </div>
        )}

        {isLoading ? (
          <p className="text-base-content/50 text-sm">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-base-content/50 text-sm">Nothing here yet.</p>
        ) : (
          <div className="divide-y divide-base-300 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="checkbox checkbox-xs checkbox-primary shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm line-through opacity-60">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-base-content/50">{item.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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

SessionDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  session: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    active: PropTypes.bool,
  }),
}
