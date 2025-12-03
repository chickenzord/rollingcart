/**
 * Custom hooks for catalog-related queries and mutations
 * Provides reusable TanStack Query hooks for catalog operations
 */

import { useQuery, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { useOfflineMutation } from '@/hooks/useOfflineMutation'
import * as catalogService from '@/services/catalogService'
import type { CatalogCategory, CatalogItem } from '@/services/catalogService'

interface CreateCategoryVariables {
  name: string
  description?: string
}

interface UpdateCategoryVariables {
  categoryId: number
  category: {
    name?: string
    description?: string
  }
}

interface CreateItemVariables {
  item: {
    name: string
    category_id?: number
    description?: string
  }
  options?: {
    addToShopping?: boolean
  }
}

interface UpdateItemVariables {
  itemId: number
  item: {
    name?: string
    category_id?: number
    description?: string
  }
}

interface CatalogItemsParams {
  includeCategory?: boolean
}

/**
 * Fetch all catalog categories
 * @returns Query result with categories array
 */
export function useCategories(): UseQueryResult<CatalogCategory[], Error> {
  return useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: catalogService.getCategories,
  })
}

/**
 * Fetch a single category by ID
 * @param categoryId - The category ID
 * @returns Query result with category object
 */
export function useCategory(categoryId: string | number): UseQueryResult<CatalogCategory, Error> {
  return useQuery({
    queryKey: ['catalog', 'categories', categoryId],
    queryFn: () => catalogService.getCategory(categoryId),
    enabled: !!categoryId, // Only fetch if categoryId exists
  })
}

/**
 * Create a new catalog category
 * @returns Mutation for creating categories
 */
export function useCreateCategory(): UseMutationResult<CatalogCategory, Error, CreateCategoryVariables> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: (category) => catalogService.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] })
    },
  })
}

/**
 * Update a catalog category
 * @returns Mutation for updating categories
 */
export function useUpdateCategory(): UseMutationResult<CatalogCategory, Error, UpdateCategoryVariables> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
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
 * @param categoryId - The category ID
 * @returns Query result with items array
 */
export function useCategoryItems(categoryId: string | number): UseQueryResult<CatalogItem[], Error> {
  return useQuery({
    queryKey: ['catalog', 'categories', categoryId, 'items'],
    queryFn: () => catalogService.getCategoryItems(categoryId),
    enabled: !!categoryId, // Only fetch if categoryId exists
  })
}

/**
 * Fetch all catalog items (with optional filters)
 * @param params - Query parameters
 * @returns Query result with items array
 */
export function useCatalogItems(params: CatalogItemsParams = {}): UseQueryResult<CatalogItem[], Error> {
  return useQuery({
    queryKey: ['catalog', 'items', params],
    queryFn: () => catalogService.getItems(params),
  })
}

/**
 * Create a new catalog item
 * @returns Mutation for creating items
 */
export function useCreateCatalogItem(): UseMutationResult<CatalogItem, Error, CreateItemVariables> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
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
 * @returns Mutation for updating items
 */
export function useUpdateCatalogItem(): UseMutationResult<CatalogItem, Error, UpdateItemVariables> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
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
 * @param itemId - The catalog item ID
 * @returns Query result with sessions array
 */
export function useItemShoppingSessions(itemId: number): UseQueryResult<unknown[], Error> {
  return useQuery({
    queryKey: ['catalog', 'items', itemId, 'shopping_sessions'],
    queryFn: () => catalogService.getItemShoppingSessions(itemId),
    enabled: !!itemId,
  })
}

/**
 * Delete a catalog item
 * @returns Mutation for deleting items
 */
export function useDeleteCatalogItem(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
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
 * @returns Mutation for deleting categories
 */
export function useDeleteCategory(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: (categoryId) => catalogService.deleteCategory(categoryId),
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] })
      // Also invalidate items since they reference categories
      queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] })
    },
  })
}
