/**
 * Custom hooks for catalog-related queries and mutations
 * Provides reusable TanStack Query hooks for catalog operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as catalogService from '../../services/catalogService'

/**
 * Fetch all catalog categories
 * @returns {UseQueryResult} Query result with categories array
 */
export function useCategories() {
  return useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: catalogService.getCategories,
  })
}

/**
 * Fetch a single category by ID
 * @param {string|number} categoryId - The category ID
 * @returns {UseQueryResult} Query result with category object
 */
export function useCategory(categoryId) {
  return useQuery({
    queryKey: ['catalog', 'categories', categoryId],
    queryFn: () => catalogService.getCategory(categoryId),
    enabled: !!categoryId, // Only fetch if categoryId exists
  })
}

/**
 * Create a new catalog category
 * @returns {UseMutationResult} Mutation for creating categories
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (category) => catalogService.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] })
    },
  })
}

/**
 * Update a catalog category
 * @returns {UseMutationResult} Mutation for updating categories
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, category }) => catalogService.updateCategory(categoryId, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] })
      // Also invalidate items since they reference categories
      queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] })
    },
  })
}

/**
 * Fetch items for a specific category
 * @param {string|number} categoryId - The category ID
 * @returns {UseQueryResult} Query result with items array
 */
export function useCategoryItems(categoryId) {
  return useQuery({
    queryKey: ['catalog', 'categories', categoryId, 'items'],
    queryFn: () => catalogService.getCategoryItems(categoryId),
    enabled: !!categoryId, // Only fetch if categoryId exists
  })
}

/**
 * Fetch all catalog items (with optional filters)
 * @param {Object} params - Query parameters
 * @param {boolean} params.includeCategory - Whether to include category data
 * @returns {UseQueryResult} Query result with items array
 */
export function useCatalogItems(params = {}) {
  return useQuery({
    queryKey: ['catalog', 'items', params],
    queryFn: () => catalogService.getItems(params),
  })
}

/**
 * Create a new catalog item
 * @returns {UseMutationResult} Mutation for creating items
 */
export function useCreateCatalogItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ item, options }) => catalogService.createItem(item, options),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] })

      // If item has a category, invalidate that category's items too
      if (variables.item.category_id) {
        queryClient.invalidateQueries({
          queryKey: ['catalog', 'categories', variables.item.category_id, 'items'],
        })
      }

      // If addToShopping option was used, also invalidate shopping items
      if (variables.options?.addToShopping) {
        queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
      }
    },
  })
}

/**
 * Update a catalog item
 * @returns {UseMutationResult} Mutation for updating items
 */
export function useUpdateCatalogItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, item }) => catalogService.updateItem(itemId, item),
    onSuccess: () => {
      // Invalidate all catalog item queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] })
    },
  })
}

/**
 * Fetch shopping sessions that contain a catalog item
 * @param {string|number} itemId - The catalog item ID
 * @returns {UseQueryResult} Query result with sessions array
 */
export function useItemShoppingSessions(itemId) {
  return useQuery({
    queryKey: ['catalog', 'items', itemId, 'shopping_sessions'],
    queryFn: () => catalogService.getItemShoppingSessions(itemId),
    enabled: !!itemId,
  })
}

/**
 * Delete a catalog item
 * @returns {UseMutationResult} Mutation for deleting items
 */
export function useDeleteCatalogItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId) => catalogService.deleteItem(itemId),
    onSuccess: () => {
      // Invalidate all catalog item queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] })
      // Invalidate all shopping items queries (they reference catalog items)
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Delete a catalog category
 * @returns {UseMutationResult} Mutation for deleting categories
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryId) => catalogService.deleteCategory(categoryId),
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] })
      // Also invalidate items since they reference categories
      queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] })
    },
  })
}
