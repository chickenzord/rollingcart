/**
 * Centralized token storage utility
 * Manages access and refresh tokens in localStorage
 */

const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'

/**
 * Get the current access token
 * @returns {string|null} The access token or null if not found
 */
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Get the current refresh token
 * @returns {string|null} The refresh token or null if not found
 */
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Store both access and refresh tokens
 * @param {string} accessToken - The JWT access token
 * @param {string} refreshToken - The refresh token
 */
export function setTokens(accessToken, refreshToken) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

/**
 * Clear all authentication tokens
 * Called on logout or when refresh fails
 */
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * Check if valid tokens exist
 * @returns {boolean} True if both tokens are present
 */
export function hasValidTokens() {
  return !!(getAccessToken() && getRefreshToken())
}
