import { createContext, useState, useContext, useEffect } from 'react'
import * as authService from '../services/authService'
import { hasValidTokens } from '../utils/tokenStorage'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    if (hasValidTokens()) {
      // Fetch user details from API (uses tokens internally)
      authService.getMe()
        .then(data => {
          setUser(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Token verification error:', error)
          // Token invalid, authService will handle clearing
          setUser(null)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    // authService.login handles token storage internally
    const userData = await authService.login(email, password)
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try {
      // authService.logout handles token cleanup internally
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
