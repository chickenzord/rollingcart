import PropTypes from 'prop-types'
import { formatTimeAgo, isSessionStale } from '../../utils/dateUtils'
import { CheckCircle, Xmark, Clock } from 'iconoir-react'

/**
 * Mobile-first active session banner
 * Compact design with essential info and quick actions
 */
export default function ActiveSessionCard({ session, hasCheckedItems, onFinish, onCancel }) {
  const isStale = isSessionStale(session.created_at)

  return (
    <div className="bg-primary/10 border-b-2 border-primary/30 p-3">
      <div className="flex items-center justify-between gap-3">
        {/* Session Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary badge-sm">SHOPPING</span>
            {isStale && (
              <span className="badge badge-warning badge-sm gap-1">
                <Clock width="12px" height="12px" strokeWidth={2} />
                Old
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-base-content truncate">
            {session.name}
          </div>
          <div className="text-xs text-base-content/60">
            Started {formatTimeAgo(session.created_at)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onFinish}
            disabled={!hasCheckedItems}
            className="btn btn-primary btn-sm gap-1"
            title={hasCheckedItems ? 'Finish shopping' : 'Check off items first'}
          >
            <CheckCircle width="16px" height="16px" strokeWidth={2} />
            Done
          </button>
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm"
            title="Cancel this shopping trip"
          >
            <Xmark width="18px" height="18px" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Helpful message when can't finish */}
      {!hasCheckedItems && (
        <div className="mt-2 text-xs text-base-content/60 italic">
          Check off items as you add them to your cart, then tap Done when finished
        </div>
      )}
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
