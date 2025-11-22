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
    <div className="mb-4 card bg-primary/10 border border-primary/30">
      <div className="card-body p-3 sm:p-4">
        {/* Header row - badge, title, time */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-primary badge-sm">SHOPPING NOW</span>
          <h2 className="font-semibold text-base sm:text-lg truncate flex-1 min-w-0">{session.name}</h2>
          <span className="text-base-content/60 text-xs whitespace-nowrap">
            {formatTimeAgo(session.created_at)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          {hasCheckedItems && (
            <button
              onClick={onFinish}
              className="btn btn-primary btn-sm flex-1 gap-1"
            >
              <CheckCircle width="16px" height="16px" strokeWidth={2} />
              <span className="hidden xs:inline">Done</span>
              <span className="xs:hidden">Done</span>
            </button>
          )}
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm gap-1"
          >
            <Xmark width="16px" height="16px" strokeWidth={2} />
            <span>Cancel</span>
          </button>
        </div>

        {/* Stale session warning - compact */}
        {isStale && (
          <div className="mt-2 flex items-start gap-2 text-warning text-xs">
            <Clock
              width="14px"
              height="14px"
              strokeWidth={2}
              className="shrink-0 mt-0.5"
            />
            <span>
              This trip has been running for a while. Consider finishing it before starting a new one.
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
