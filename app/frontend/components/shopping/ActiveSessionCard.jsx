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
    <div className="mb-6 p-6 border-2 border-info-500 rounded-lg bg-info-50">
      <div className="flex justify-between items-start">
        <div>
          <div className="inline-block px-3 py-1 bg-info-600 text-white text-xs font-semibold rounded mb-2">
            SHOPPING NOW
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{session.name}</h2>
          <p className="text-gray-600 text-sm">Started {formatTimeAgo(session.created_at)}</p>
        </div>
        <div className="flex gap-2">
          {hasCheckedItems && (
            <button
              onClick={onFinish}
              className="flex items-center gap-2 px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded font-medium transition-colors"
            >
              <CheckCircle width="20px" height="20px" strokeWidth={2} />
              Done Shopping
            </button>
          )}
          <button
            onClick={onCancel}
            className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
              hasCheckedItems
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                : 'bg-error-600 hover:bg-error-700 text-white'
            }`}
          >
            <Xmark width="20px" height="20px" strokeWidth={2} />
            Cancel Trip
          </button>
        </div>
      </div>

      {/* Stale session warning - gentle nudge */}
      {isStale && (
        <div className="mt-4 px-3 py-2 bg-warning-50 border-l-4 border-warning-400 rounded">
          <div className="flex items-start gap-2">
            <Clock
              width="18px"
              height="18px"
              strokeWidth={2}
              className="text-warning-700 mt-0.5 shrink-0"
            />
            <p className="text-sm text-warning-700">
              Heads up: This shopping trip has been running for a while. Consider marking this trip as done before starting a new one!
            </p>
          </div>
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
