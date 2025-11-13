/**
 * Catalog API service
 * All functions automatically use stored auth token
 */
import { get, post } from './api'

/**
 * Fetch all catalog categories
 * @returns {Promise<Array>} Categories
 */
export async function getCategories() {
  return get('/api/v1/catalog/categories')
}

/**
 * Fetch a single category by ID
 * @param {string|number} categoryId
 * @returns {Promise<Object>} Category
 */
export async function getCategory(categoryId) {
  return get(`/api/v1/catalog/categories/${categoryId}`)
}

/**
 * Fetch items for a specific category
 * @param {string|number} categoryId
 * @returns {Promise<Array>} Items
 */
export async function getCategoryItems(categoryId) {
  return get(`/api/v1/catalog/categories/${categoryId}/items`)
}

/**
 * Fetch all catalog items
 * @param {Object} options - Query options
 * @param {boolean} options.includeCategory - Include category in response
 * @returns {Promise<Array>} Items
 */
export async function getItems(options = {}) {
  const params = new URLSearchParams()
  if (options.includeCategory) {
    params.append('include_category', 'true')
  }

  const url = params.toString()
    ? `/api/v1/catalog/items?${params.toString()}`
    : '/api/v1/catalog/items'

  return get(url)
}

/**
 * Create a new catalog item
 * @param {Object} itemData - Item data
 * @param {string} itemData.name - Item name
 * @param {number} itemData.category_id - Category ID (optional)
 * @param {string} itemData.description - Description (optional)
 * @param {Object} options - Additional options
 * @param {boolean} options.addToShopping - Also add to shopping backlog
 * @returns {Promise<Object>} Created item
 */
export async function createItem(itemData, options = {}) {
  const params = new URLSearchParams()
  if (options.addToShopping) {
    params.append('add_to_shopping', 'true')
  }

  const url = params.toString()
    ? `/api/v1/catalog/items?${params.toString()}`
    : '/api/v1/catalog/items'

  return post(url, { item: itemData })
}
