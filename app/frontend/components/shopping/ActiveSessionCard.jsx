import PropTypes from 'prop-types'
import { formatTimeAgo } from '../../utils/dateUtils'
import { CheckCircle, Xmark } from 'iconoir-react'

/**
 * Active session information card
 * Displays session name, start time, and action buttons (Finish/Cancel)
 */
export default function ActiveSessionCard({ session, hasCheckedItems, onFinish, onCancel }) {
  return (
    <div className="mb-6 p-6 border-2 border-blue-500 rounded-lg bg-blue-50">
      <div className="flex justify-between items-start">
        <div>
          <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded mb-2">
            SHOPPING NOW
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{session.name}</h2>
          <p className="text-gray-600 text-sm">Started {formatTimeAgo(session.created_at)}</p>
        </div>
        {hasCheckedItems ? (
          <button
            onClick={onFinish}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
          >
            <CheckCircle width="20px" height="20px" strokeWidth={2} />
            Done Shopping
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
          >
            <Xmark width="20px" height="20px" strokeWidth={2} />
            Cancel Trip
          </button>
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
