/**
 * Authentication API service
 * Handles login, logout, and user verification
 * Token management is internal - components don't need to handle tokens
 */

import { setTokens, clearTokens, getAccessToken } from '../utils/tokenStorage'

/**
 * Login with email and password
 * Stores tokens internally
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} User data
 */
export async function login(email, password) {
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

  const data = await response.json()

  // Extract and store both tokens
  // Rodauth with jwt_refresh returns: { access_token, refresh_token }
  if (data.access_token && data.refresh_token) {
    setTokens(data.access_token, data.refresh_token)
  } else {
    throw new Error('Invalid response from server - missing tokens')
  }

  // Fetch user details
  return getMe()
}

/**
 * Get current user details
 * Uses token from storage internally
 * @returns {Promise<Object>} User data
 */
export async function getMe() {
  const token = getAccessToken()

  if (!token) {
    throw new Error('No authentication token')
  }

  const response = await fetch('/api/v1/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user details')
  }

  return response.json()
}

/**
 * Logout current user
 * Clears tokens from storage
 */
export async function logout() {
  const token = getAccessToken()

  if (token) {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Always clear tokens, even if API call fails
  clearTokens()
}
