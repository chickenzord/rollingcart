/**
 * Base API utilities for making authenticated requests
 */

class APIError extends Error {
  constructor(message, status, response) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.response = response
  }
}

/**
 * Make an authenticated API request
 * @param {string} url - The API endpoint
 * @param {Object} options - Fetch options
 * @param {string} token - JWT auth token
 * @returns {Promise<any>} - Response data
 */
export async function apiRequest(url, options = {}, token) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = token
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 204 No Content
  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new APIError(
      data?.error || `Request failed with status ${response.status}`,
      response.status,
      data,
    )
  }

  return data
}

/**
 * Make a GET request
 */
export async function get(url, token) {
  return apiRequest(url, { method: 'GET' }, token)
}

/**
 * Make a POST request
 */
export async function post(url, body, token) {
  return apiRequest(
    url,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    token,
  )
}

/**
 * Make a PATCH request
 */
export async function patch(url, body, token) {
  return apiRequest(
    url,
    {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    },
    token,
  )
}

/**
 * Make a DELETE request
 */
export async function del(url, token) {
  return apiRequest(url, { method: 'DELETE' }, token)
}
