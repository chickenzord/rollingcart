import { createContext, useContext, useState, useCallback } from 'react'
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

  const addFlash = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setMessages(prev => [...prev, { id, message, type }])
    return id
  }, [])

  const removeFlash = useCallback((id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setMessages([])
  }, [])

  // Convenience methods for each severity
  const flash = {
    info: (message) => addFlash(message, 'info'),
    success: (message) => addFlash(message, 'success'),
    warning: (message) => addFlash(message, 'warning'),
    error: (message) => addFlash(message, 'error'),
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
