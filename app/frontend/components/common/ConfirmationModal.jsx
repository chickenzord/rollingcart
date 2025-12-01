import PropTypes from 'prop-types'
import { WarningCircle, InfoCircle } from 'iconoir-react'

/**
 * Reusable confirmation modal dialog
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Callback when modal is closed/cancelled
 * @param {function} props.onConfirm - Callback when confirm button is clicked
 * @param {string} props.title - Modal title
 * @param {string|React.ReactNode} props.message - Modal message (can be string or JSX)
 * @param {string} props.confirmText - Text for confirm button (default: "Confirm")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {string} props.severity - Severity level: "danger", "warning", "info" (default: "info")
 * @param {boolean} props.isLoading - Whether the confirm action is in progress
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'info',
  isLoading = false,
}) {
  if (!isOpen) return null

  const severityConfig = {
    danger: {
      icon: WarningCircle,
      iconColor: 'text-error',
      buttonClass: 'btn-error',
    },
    warning: {
      icon: WarningCircle,
      iconColor: 'text-warning',
      buttonClass: 'btn-warning',
    },
    info: {
      icon: InfoCircle,
      iconColor: 'text-info',
      buttonClass: 'btn-primary',
    },
  }

  const config = severityConfig[severity] || severityConfig.info
  const Icon = config.icon

  const handleBackdropClick = () => {
    if (!isLoading) {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose()
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        {/* Icon and Title */}
        <div className="flex items-start gap-3 mb-4">
          <Icon width="24px" height="24px" strokeWidth={2} className={`${config.iconColor} shrink-0 mt-0.5`} />
          <h3 className="font-bold text-lg flex-1">{title}</h3>
        </div>

        {/* Message */}
        <div className="py-2">
          {typeof message === 'string' ? (
            <p className="text-base-content/80">{message}</p>
          ) : (
            message
          )}
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn ${config.buttonClass}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Loading...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      ></div>
    </div>
  )
}

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  severity: PropTypes.oneOf(['danger', 'warning', 'info']),
  isLoading: PropTypes.bool,
}
