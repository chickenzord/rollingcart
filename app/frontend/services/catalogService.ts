/**
 * Catalog API service
 * All functions automatically use stored auth token
 */
import { get, post, patch, del } from '@/services/api'

export interface CatalogCategory {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CatalogItem {
  id: number
  name: string
  description?: string
  category_id?: number
  category?: CatalogCategory
  created_at: string
  updated_at: string
}

interface CreateCategoryData {
  name: string
  description?: string
}

interface UpdateCategoryData {
  name?: string
  description?: string
}

interface CreateItemData {
  name: string
  category_id?: number
  description?: string
}

interface UpdateItemData {
  name?: string
  category_id?: number
  description?: string
}

interface GetItemsOptions {
  includeCategory?: boolean
}

interface CreateItemOptions {
  addToShopping?: boolean
}

/**
 * Fetch all catalog categories
 * @returns Categories
 */
export async function getCategories(): Promise<CatalogCategory[]> {
  return get<CatalogCategory[]>('/api/v1/catalog/categories')
}

/**
 * Fetch a single category by ID
 * @param categoryId - Category ID
 * @returns Category
 */
export async function getCategory(categoryId: string | number): Promise<CatalogCategory> {
  return get<CatalogCategory>(`/api/v1/catalog/categories/${categoryId}`)
}

/**
 * Create a new catalog category
 * @param categoryData - Category data
 * @returns Created category
 */
export async function createCategory(categoryData: CreateCategoryData): Promise<CatalogCategory> {
  return post<CatalogCategory>('/api/v1/catalog/categories', { category: categoryData })
}

/**
 * Update a catalog category
 * @param categoryId - Category ID to update
 * @param categoryData - Category data to update
 * @returns Updated category
 */
export async function updateCategory(categoryId: number, categoryData: UpdateCategoryData): Promise<CatalogCategory> {
  return patch<CatalogCategory>(`/api/v1/catalog/categories/${categoryId}`, { category: categoryData })
}

/**
 * Fetch items for a specific category
 * @param categoryId - Category ID
 * @returns Items
 */
export async function getCategoryItems(categoryId: string | number): Promise<CatalogItem[]> {
  return get<CatalogItem[]>(`/api/v1/catalog/categories/${categoryId}/items`)
}

/**
 * Fetch all catalog items
 * @param options - Query options
 * @returns Items
 */
export async function getItems(options: GetItemsOptions = {}): Promise<CatalogItem[]> {
  const params = new URLSearchParams()
  if (options.includeCategory) {
    params.append('include_category', 'true')
  }

  const url = params.toString()
    ? `/api/v1/catalog/items?${params.toString()}`
    : '/api/v1/catalog/items'

  return get<CatalogItem[]>(url)
}

/**
 * Create a new catalog item
 * @param itemData - Item data
 * @param options - Additional options
 * @returns Created item
 */
export async function createItem(itemData: CreateItemData, options: CreateItemOptions = {}): Promise<CatalogItem> {
  const params = new URLSearchParams()
  if (options.addToShopping) {
    params.append('add_to_shopping', 'true')
  }

  const url = params.toString()
    ? `/api/v1/catalog/items?${params.toString()}`
    : '/api/v1/catalog/items'

  return post<CatalogItem>(url, { item: itemData })
}

/**
 * Update a catalog item
 * @param itemId - Item ID to update
 * @param itemData - Item data to update
 * @returns Updated item
 */
export async function updateItem(itemId: number, itemData: UpdateItemData): Promise<CatalogItem> {
  return patch<CatalogItem>(`/api/v1/catalog/items/${itemId}`, { item: itemData })
}

/**
 * Delete a catalog item
 * @param itemId - Item ID to delete
 */
export async function deleteItem(itemId: number): Promise<void> {
  return del<void>(`/api/v1/catalog/items/${itemId}`)
}

/**
 * Get shopping sessions that contain a catalog item
 * @param itemId - Item ID
 * @returns Shopping sessions
 */
export async function getItemShoppingSessions(itemId: number): Promise<unknown[]> {
  return get<unknown[]>(`/api/v1/catalog/items/${itemId}/shopping_sessions`)
}

/**
 * Delete a catalog category
 * @param categoryId - Category ID to delete
 */
export async function deleteCategory(categoryId: number): Promise<void> {
  return del<void>(`/api/v1/catalog/categories/${categoryId}`)
}
