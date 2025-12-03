/**
 * Centralized token storage utility
 * Manages access and refresh tokens in localStorage
 */

const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'

/**
 * Get the current access token
 * @returns The access token or null if not found
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Get the current refresh token
 * @returns The refresh token or null if not found
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Store both access and refresh tokens
 * @param accessToken - The JWT access token
 * @param refreshToken - The refresh token
 */
export function setTokens(accessToken: string, refreshToken: string): void {
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
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * Check if valid tokens exist
 * @returns True if both tokens are present
 */
export function hasValidTokens(): boolean {
  return !!(getAccessToken() && getRefreshToken())
}
