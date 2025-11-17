import { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from '../common/Modal'
import { WarningCircle } from 'iconoir-react'

/**
 * Modal for canceling a shopping session
 * Gives users two options:
 * - Keep Items: Uncheck items and return them to backlog
 * - Remove Items: Delete items permanently
 */
export default function CancelSessionModal({
  isOpen,
  onClose,
  sessionId,
  itemCount,
  onKeepItems,
  onRemoveItems,
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeAction, setActiveAction] = useState(null) // 'keep' or 'remove'

  const handleKeepItems = async () => {
    setActiveAction('keep')
    setIsLoading(true)
    try {
      await onKeepItems(sessionId)
      onClose()
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
      setActiveAction(null)
    }
  }

  const handleRemoveItems = async () => {
    setActiveAction('remove')
    setIsLoading(true)
    try {
      await onRemoveItems(sessionId)
      onClose()
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
      setActiveAction(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title="Cancel Shopping Trip?">
      <div className="space-y-4">
        {/* Informational Message */}
        <div className="flex items-start gap-3 p-3 bg-info-50 border-l-4 border-info-400 rounded">
          <WarningCircle
            width="20px"
            height="20px"
            strokeWidth={2}
            className="text-info-700 mt-0.5 shrink-0"
          />
          <div className="text-sm text-info-700">
            <p className="font-medium mb-2">
              You&rsquo;re about to cancel this trip. You have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart.
            </p>
            <p className="mb-1">What would you like to do with {itemCount === 1 ? 'it' : 'them'}?</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleKeepItems}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded font-medium transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              {isLoading && activeAction === 'keep' && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              <div>
                <div className="font-semibold">Keep for later</div>
                <div className="text-xs opacity-90">Return {itemCount === 1 ? 'this item' : 'these items'} to your backlog for your next shopping trip</div>
              </div>
            </div>
          </button>

          <button
            onClick={handleRemoveItems}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-error-600 hover:bg-error-700 disabled:bg-gray-300 text-white rounded font-medium transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              {isLoading && activeAction === 'remove' && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              <div>
                <div className="font-semibold">Don&rsquo;t need {itemCount === 1 ? 'it' : 'them'} anymore</div>
                <div className="text-xs opacity-90">Remove {itemCount === 1 ? 'this item' : 'these items'} from your backlog completely</div>
              </div>
            </div>
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded font-medium transition-colors"
          >
            Keep Shopping
          </button>
        </div>
      </div>
    </Modal>
  )
}

CancelSessionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  sessionId: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  onKeepItems: PropTypes.func.isRequired,
  onRemoveItems: PropTypes.func.isRequired,
}
