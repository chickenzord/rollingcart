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
    <div className="mb-4 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
      {/* Line 1 - Badge */}
      <div className="mb-1">
        <span className="badge badge-primary badge-xs">SHOPPING NOW</span>
      </div>

      {/* Line 2 - Information */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium truncate">{session.name}</span>
        <span className="text-base-content/50">·</span>
        <span className="text-base-content/60 text-xs whitespace-nowrap">
          {formatTimeAgo(session.created_at)}
        </span>
        {isStale && (
          <>
            <span className="text-base-content/50">·</span>
            <span className="text-warning text-xs flex items-center gap-1">
              <Clock width="12px" height="12px" strokeWidth={2} />
              Stale
            </span>
          </>
        )}
      </div>

      {/* Line 3 - Actions */}
      <div className="flex mt-2 justify-end">
        <div className="join">
          <button
            onClick={onFinish}
            disabled={!hasCheckedItems}
            className="btn btn-primary btn-xs gap-1 join-item"
          >
            <CheckCircle width="14px" height="14px" strokeWidth={2} />
            Done
          </button>
          <button
            onClick={onCancel}
            className="btn btn-soft btn-xs gap-1 join-item"
          >
            <Xmark width="14px" height="14px" strokeWidth={2} />
            Cancel
          </button>
        </div>
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
