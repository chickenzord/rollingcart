import PropTypes from 'prop-types'

/**
 * DaisyUI modal wrapper component
 * Features (handled by DaisyUI):
 * - Click backdrop to close
 * - ESC key to close
 * - Centered with animation
 * - Body scroll prevention
 * - Accessible (ARIA attributes)
 */
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <dialog className="modal modal-open" onClose={onClose}>
      <div className="modal-box">
        {/* Close button (top-right X) */}
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        {title && (
          <h2 className="text-xl font-bold mb-4">{title}</h2>
        )}

        {/* Modal Body */}
        {children}
      </div>

      {/* Backdrop - click to close */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
}
