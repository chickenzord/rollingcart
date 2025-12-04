/**
 * Shopping API service
 * All functions automatically use stored auth token
 */
import { get, post, patch, del } from '@/services/api'
import type { CatalogItem } from '@/services/catalogService'

export interface ShoppingSession {
  id: number
  name: string
  active: boolean
  started_at: string
  finished_at?: string
  created_at: string
  updated_at: string
}

export interface ShoppingItem {
  id: number
  catalog_item_id: number
  catalog_item: CatalogItem
  is_done: boolean
  shopping_session_id?: number
  created_at: string
  updated_at: string
}

interface GetItemsOptions {
  isDone?: boolean
  forSession?: string | number
}

/**
 * Fetch all shopping sessions
 * @returns All sessions (ordered by created_at desc)
 */
export async function getAllSessions(): Promise<ShoppingSession[]> {
  return get<ShoppingSession[]>('/api/v1/shopping/sessions')
}

/**
 * Fetch active shopping session
 * @returns Active session or null
 */
export async function getActiveSession(): Promise<ShoppingSession | null> {
  return get<ShoppingSession | null>('/api/v1/shopping/sessions/active')
}

/**
 * Create a new shopping session
 * @returns Created session
 */
export async function createSession(): Promise<ShoppingSession> {
  return post<ShoppingSession>('/api/v1/shopping/sessions', { session: { active: true } })
}

/**
 * Finish a shopping session
 * @param sessionId - Session ID
 * @returns Updated session
 */
export async function finishSession(sessionId: string | number): Promise<ShoppingSession> {
  return patch<ShoppingSession>(`/api/v1/shopping/sessions/${sessionId}/finish`, null)
}

/**
 * Reactivate a finished shopping session
 * @param sessionId - Session ID
 * @returns Updated session
 */
export async function reactivateSession(sessionId: string | number): Promise<ShoppingSession> {
  return patch<ShoppingSession>(`/api/v1/shopping/sessions/${sessionId}`, { session: { active: true } })
}

/**
 * Delete/cancel a shopping session
 * @param sessionId - Session ID
 */
export async function deleteSession(sessionId: string | number): Promise<void> {
  return del<void>(`/api/v1/shopping/sessions/${sessionId}`)
}

/**
 * Uncheck all items in a session (return to backlog)
 * @param sessionId - Session ID
 */
export async function uncheckSessionItems(sessionId: string | number): Promise<void> {
  return post<void>(`/api/v1/shopping/sessions/${sessionId}/items/uncheck`, null)
}

/**
 * Delete all items in a session
 * @param sessionId - Session ID
 */
export async function deleteSessionItems(sessionId: string | number): Promise<void> {
  return del<void>(`/api/v1/shopping/sessions/${sessionId}/items`)
}

/**
 * Fetch shopping items
 * @param options - Query options
 * @returns Shopping items
 */
export async function getItems(options: GetItemsOptions = {}): Promise<ShoppingItem[]> {
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

  return get<ShoppingItem[]>(url)
}

/**
 * Add a catalog item to shopping backlog
 * @param catalogItemId - Catalog item ID
 * @returns Created shopping item
 */
export async function addItem(catalogItemId: string | number): Promise<ShoppingItem> {
  return post<ShoppingItem>('/api/v1/shopping/items', { catalog_item_id: catalogItemId })
}

/**
 * Check a shopping item (mark as done)
 * @param itemId - Shopping item ID
 * @returns Updated item
 */
export async function checkItem(itemId: string | number): Promise<ShoppingItem> {
  return patch<ShoppingItem>(`/api/v1/shopping/items/${itemId}/check`, null)
}

/**
 * Uncheck a shopping item (mark as not done)
 * @param itemId - Shopping item ID
 * @returns Updated item
 */
export async function uncheckItem(itemId: string | number): Promise<ShoppingItem> {
  return patch<ShoppingItem>(`/api/v1/shopping/items/${itemId}/uncheck`, null)
}

/**
 * Delete a shopping item
 * @param itemId - Shopping item ID
 */
export async function deleteItem(itemId: string | number): Promise<void> {
  return del<void>(`/api/v1/shopping/items/${itemId}`)
}
