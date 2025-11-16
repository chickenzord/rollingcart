/**
 * Shopping API service
 * All functions automatically use stored auth token
 */
import { get, post, patch, del } from './api'

/**
 * Fetch all shopping sessions
 * @returns {Promise<Array>} All sessions (ordered by created_at desc)
 */
export async function getAllSessions() {
  return get('/api/v1/shopping/sessions')
}

/**
 * Fetch active shopping session
 * @returns {Promise<Object|null>} Active session or null
 */
export async function getActiveSession() {
  return get('/api/v1/shopping/sessions/active')
}

/**
 * Create a new shopping session
 * @returns {Promise<Object>} Created session
 */
export async function createSession() {
  return post('/api/v1/shopping/sessions', { session: { active: true } })
}

/**
 * Finish a shopping session
 * @param {string|number} sessionId
 * @returns {Promise<Object>} Updated session
 */
export async function finishSession(sessionId) {
  return patch(`/api/v1/shopping/sessions/${sessionId}/finish`, null)
}

/**
 * Delete/cancel a shopping session
 * @param {string|number} sessionId
 */
export async function deleteSession(sessionId) {
  return del(`/api/v1/shopping/sessions/${sessionId}`)
}

/**
 * Fetch shopping items
 * @param {Object} options - Query options
 * @param {boolean} options.isDone - Filter by is_done status
 * @param {string|number} options.forSession - Filter by session ID
 * @returns {Promise<Array>} Shopping items
 */
export async function getItems(options = {}) {
  const params = new URLSearchParams()

  if (options.isDone !== undefined) {
    params.append('is_done', options.isDone.toString())
  }

  if (options.forSession !== undefined) {
    params.append('for_session', options.forSession.toString())
  }

  const url = params.toString()
    ? `/api/v1/shopping/items?${params.toString()}`
    : '/api/v1/shopping/items'

  return get(url)
}

/**
 * Add a catalog item to shopping backlog
 * @param {string|number} catalogItemId
 * @returns {Promise<Object>} Created shopping item
 */
export async function addItem(catalogItemId) {
  return post('/api/v1/shopping/items', { catalog_item_id: catalogItemId })
}

/**
 * Check a shopping item (mark as done)
 * @param {string|number} itemId
 * @returns {Promise<Object>} Updated item
 */
export async function checkItem(itemId) {
  return patch(`/api/v1/shopping/items/${itemId}/check`, null)
}

/**
 * Uncheck a shopping item (mark as not done)
 * @param {string|number} itemId
 * @returns {Promise<Object>} Updated item
 */
export async function uncheckItem(itemId) {
  return patch(`/api/v1/shopping/items/${itemId}/uncheck`, null)
}

/**
 * Delete a shopping item
 * @param {string|number} itemId
 */
export async function deleteItem(itemId) {
  return del(`/api/v1/shopping/items/${itemId}`)
}
