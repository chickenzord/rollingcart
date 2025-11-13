/**
 * Authentication API service
 */

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: Object}>}
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

  // Get JWT token from Authorization header
  const authHeader = response.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('No authorization token received')
  }

  return { token: authHeader }
}

/**
 * Get current user details
 * @param {string} token - JWT token
 * @returns {Promise<Object>} User data
 */
export async function getMe(token) {
  const response = await fetch('/api/v1/me', {
    headers: {
      'Authorization': token,
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
 * @param {string} token - JWT token
 */
export async function logout(token) {
  await fetch('/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  })
}
