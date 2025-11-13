import { createContext, useState, useContext, useEffect } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('authToken'))

  // Check if user is authenticated on mount
  useEffect(() => {
    if (token) {
      // Fetch user details from API
      authService.getMe(token)
        .then(data => {
          setUser(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Token verification error:', error)
          // Token invalid, clear it
          localStorage.removeItem('authToken')
          setToken(null)
          setUser(null)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const { token: authToken } = await authService.login(email, password)

    localStorage.setItem('authToken', authToken)
    setToken(authToken)

    // Fetch user details from API
    try {
      const userData = await authService.getMe(authToken)
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout(token)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('authToken')
      setToken(null)
      setUser(null)
    }
  }

  const value = {
    user,
    token,
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
