/**
 * Base API utilities for making authenticated requests
 * Handles automatic token refresh on 401 errors
 */

import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/tokenStorage'

export class APIError extends Error {
  status: number
  response: unknown

  constructor(message: string, status: number, response: unknown) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.response = response
  }
}

interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
}

// Flag to prevent infinite refresh loops
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

/**
 * Refresh the access token using the refresh token
 * @returns True if refresh successful, false otherwise
 */
async function refreshAccessToken(): Promise<boolean> {
  // If already refreshing, wait for that promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken()
      const accessToken = getAccessToken()

      if (!refreshToken || !accessToken) {
        clearTokens()
        return false
      }

      const response = await fetch('/auth/jwt-refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      })

      if (!response.ok) {
        clearTokens()
        return false
      }

      const data: RefreshTokenResponse = await response.json()

      // Store new tokens
      setTokens(data.access_token, data.refresh_token)
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      clearTokens()
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Make an authenticated API request
 * Automatically handles token refresh on 401 errors
 * @param url - The API endpoint
 * @param options - Fetch options
 * @param isRetry - Internal flag to prevent infinite retry loops
 * @returns Response data
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  }

  // Add access token if available
  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }

  const data = await response.json().catch(() => null)

  // Handle 401 Unauthorized - attempt token refresh
  if (response.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken()

    if (refreshed) {
      // Retry the original request with new token
      return apiRequest<T>(url, options, true)
    } else {
      // Refresh failed - clear tokens and throw
      // This will cause AuthContext to detect no tokens and redirect to login
      throw new APIError(
        'Session expired. Please login again.',
        401,
        data,
      )
    }
  }

  if (!response.ok) {
    throw new APIError(
      data?.error || `Request failed with status ${response.status}`,
      response.status,
      data,
    )
  }

  return data as T
}

/**
 * Make a GET request
 */
export async function get<T = unknown>(url: string): Promise<T> {
  return apiRequest<T>(url, { method: 'GET' })
}

/**
 * Make a POST request
 */
export async function post<T = unknown>(url: string, body?: unknown): Promise<T> {
  return apiRequest<T>(
    url,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}

/**
 * Make a PATCH request
 */
export async function patch<T = unknown>(url: string, body?: unknown): Promise<T> {
  return apiRequest<T>(
    url,
    {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    },
  )
}

/**
 * Make a DELETE request
 */
export async function del<T = unknown>(url: string): Promise<T> {
  return apiRequest<T>(url, { method: 'DELETE' })
}
