import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const FlashContext = createContext(null)

/**
 * Flash message types matching DaisyUI alert variants:
 * - info: General information (alert-info)
 * - success: Success message (alert-success)
 * - warning: Warning message (alert-warning)
 * - error: Error message (alert-error)
 */

export function FlashProvider({ children }) {
  const [messages, setMessages] = useState([])
  const timersRef = useRef({})

  const removeFlash = useCallback((id) => {
    // First mark as dismissing to trigger exit animation
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, dismissing: true } : msg
    ))

    // Then remove after animation completes (200ms)
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id))
    }, 200)

    // Clear auto-dismiss timer if exists
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id])
      delete timersRef.current[id]
    }
  }, [])

  const addFlash = useCallback((message, type = 'info', autoDismiss = false) => {
    const id = Date.now() + Math.random()
    setMessages(prev => [...prev, { id, message, type }])

    // Set up auto-dismiss timer if enabled
    if (autoDismiss) {
      timersRef.current[id] = setTimeout(() => {
        removeFlash(id)
      }, 5000)
    }

    return id
  }, [removeFlash])

  const clearAll = useCallback(() => {
    // Clear all timers
    Object.values(timersRef.current).forEach(timer => clearTimeout(timer))
    timersRef.current = {}
    setMessages([])
  }, [])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(timer => clearTimeout(timer))
    }
  }, [])

  // Convenience methods for each severity
  const flash = {
    info: (message, autoDismiss = true) => addFlash(message, 'info', autoDismiss),
    success: (message, autoDismiss = true) => addFlash(message, 'success', autoDismiss),
    warning: (message, autoDismiss = true) => addFlash(message, 'warning', autoDismiss),
    error: (message, autoDismiss = true) => addFlash(message, 'error', autoDismiss),
  }

  return (
    <FlashContext.Provider value={{ messages, addFlash, removeFlash, clearAll, flash }}>
      {children}
    </FlashContext.Provider>
  )
}

FlashProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function useFlash() {
  const context = useContext(FlashContext)
  if (!context) {
    throw new Error('useFlash must be used within a FlashProvider')
  }
  return context
}
