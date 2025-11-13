import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('authToken'))

  // Check if user is authenticated on mount
  useEffect(() => {
    if (token) {
      // Fetch user details from API
      fetch('/api/v1/me', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          throw new Error('Token invalid')
        })
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
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    // Get JWT token from Authorization header
    const authHeader = response.headers.get('Authorization')
    if (authHeader) {
      localStorage.setItem('authToken', authHeader)
      setToken(authHeader)

      // Fetch user details from API
      try {
        const meResponse = await fetch('/api/v1/me', {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })

        if (meResponse.ok) {
          const userData = await meResponse.json()
          setUser(userData)
          return userData
        } else {
          throw new Error('Failed to fetch user details')
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error)
        throw error
      }
    } else {
      throw new Error('No authorization token received')
    }
  }

  const logout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      })
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
