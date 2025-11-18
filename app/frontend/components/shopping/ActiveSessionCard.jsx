import PropTypes from 'prop-types'
import { formatTimeAgo, isSessionStale } from '../../utils/dateUtils'
import { CheckCircle, Xmark, Clock } from 'iconoir-react'

/**
 * Active session information card
 * Displays session name, start time, stale warning (if applicable), and action buttons (Finish/Cancel)
 */
export default function ActiveSessionCard({ session, hasCheckedItems, onFinish, onCancel }) {
  const isStale = isSessionStale(session.created_at)

  return (
    <div className="mb-6 card bg-primary/10 border border-primary/30">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <div className="badge badge-primary mb-2">
              SHOPPING NOW
            </div>
            <h2 className="card-title text-2xl mb-1">{session.name}</h2>
            <p className="text-base-content/70 text-sm">Started {formatTimeAgo(session.created_at)}</p>
          </div>
          <div className="flex gap-2">
            {hasCheckedItems && (
              <button
                onClick={onFinish}
                className="btn btn-primary gap-2"
              >
                <CheckCircle width="20px" height="20px" strokeWidth={2} />
                Done Shopping
              </button>
            )}
            <button
              onClick={onCancel}
              className="btn btn-ghost gap-2"
            >
              <Xmark width="20px" height="20px" strokeWidth={2} />
              Cancel Trip
            </button>
          </div>
        </div>

        {/* Stale session warning - gentle nudge */}
        {isStale && (
          <div className="mt-4 alert alert-warning">
            <Clock
              width="18px"
              height="18px"
              strokeWidth={2}
              className="shrink-0"
            />
            <span className="text-sm">
              Heads up: This shopping trip has been running for a while. Consider marking this trip as done before starting a new one!
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

ActiveSessionCard.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  hasCheckedItems: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
