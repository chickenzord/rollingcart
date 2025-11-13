/**
 * Shopping API service
 */
import { get, post, patch, del } from './api'

/**
 * Fetch active shopping session
 * @param {string} token - JWT token
 * @returns {Promise<Object|null>} Active session or null
 */
export async function getActiveSession(token) {
  return get('/api/v1/shopping/sessions/active', token)
}

/**
 * Create a new shopping session
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Created session
 */
export async function createSession(token) {
  return post('/api/v1/shopping/sessions', { session: { active: true } }, token)
}

/**
 * Finish a shopping session
 * @param {string|number} sessionId
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Updated session
 */
export async function finishSession(sessionId, token) {
  return patch(`/api/v1/shopping/sessions/${sessionId}/finish`, null, token)
}

/**
 * Delete/cancel a shopping session
 * @param {string|number} sessionId
 * @param {string} token - JWT token
 */
export async function deleteSession(sessionId, token) {
  return del(`/api/v1/shopping/sessions/${sessionId}`, token)
}

/**
 * Fetch shopping items
 * @param {Object} options - Query options
 * @param {boolean} options.isDone - Filter by is_done status
 * @param {string|number} options.forSession - Filter by session ID
 * @param {string} token - JWT token
 * @returns {Promise<Array>} Shopping items
 */
export async function getItems(options = {}, token) {
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

  return get(url, token)
}

/**
 * Add a catalog item to shopping backlog
 * @param {string|number} catalogItemId
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Created shopping item
 */
export async function addItem(catalogItemId, token) {
  return post('/api/v1/shopping/items', { catalog_item_id: catalogItemId }, token)
}

/**
 * Check a shopping item (mark as done)
 * @param {string|number} itemId
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Updated item
 */
export async function checkItem(itemId, token) {
  return patch(`/api/v1/shopping/items/${itemId}/check`, null, token)
}

/**
 * Uncheck a shopping item (mark as not done)
 * @param {string|number} itemId
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Updated item
 */
export async function uncheckItem(itemId, token) {
  return patch(`/api/v1/shopping/items/${itemId}/uncheck`, null, token)
}

/**
 * Delete a shopping item
 * @param {string|number} itemId
 * @param {string} token - JWT token
 */
export async function deleteItem(itemId, token) {
  return del(`/api/v1/shopping/items/${itemId}`, token)
}
