/**
 * Catalog API service
 */
import { get, post } from './api'

/**
 * Fetch all catalog categories
 * @param {string} token - JWT token
 * @returns {Promise<Array>} Categories
 */
export async function getCategories(token) {
  return get('/api/v1/catalog/categories', token)
}

/**
 * Fetch a single category by ID
 * @param {string|number} categoryId
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Category
 */
export async function getCategory(categoryId, token) {
  return get(`/api/v1/catalog/categories/${categoryId}`, token)
}

/**
 * Fetch items for a specific category
 * @param {string|number} categoryId
 * @param {string} token - JWT token
 * @returns {Promise<Array>} Items
 */
export async function getCategoryItems(categoryId, token) {
  return get(`/api/v1/catalog/categories/${categoryId}/items`, token)
}

/**
 * Fetch all catalog items
 * @param {Object} options - Query options
 * @param {boolean} options.includeCategory - Include category in response
 * @param {string} token - JWT token
 * @returns {Promise<Array>} Items
 */
export async function getItems(options = {}, token) {
  const params = new URLSearchParams()
  if (options.includeCategory) {
    params.append('include_category', 'true')
  }

  const url = params.toString()
    ? `/api/v1/catalog/items?${params.toString()}`
    : '/api/v1/catalog/items'

  return get(url, token)
}

/**
 * Create a new catalog item
 * @param {Object} itemData - Item data
 * @param {string} itemData.name - Item name
 * @param {number} itemData.category_id - Category ID (optional)
 * @param {string} itemData.description - Description (optional)
 * @param {Object} options - Additional options
 * @param {boolean} options.addToShopping - Also add to shopping backlog
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Created item
 */
export async function createItem(itemData, options = {}, token) {
  const params = new URLSearchParams()
  if (options.addToShopping) {
    params.append('add_to_shopping', 'true')
  }

  const url = params.toString()
    ? `/api/v1/catalog/items?${params.toString()}`
    : '/api/v1/catalog/items'

  return post(url, { item: itemData }, token)
}
