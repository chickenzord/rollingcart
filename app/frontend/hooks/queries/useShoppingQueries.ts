/**
 * Custom hooks for shopping-related queries and mutations
 * Provides reusable TanStack Query hooks for shopping operations
 */

import { useQuery, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { useOfflineMutation } from '@/hooks/useOfflineMutation'
import * as shoppingService from '@/services/shoppingService'
import type { ShoppingSession, ShoppingItem } from '@/services/shoppingService'

interface ShoppingItemsParams {
  isDone?: boolean
  forSession?: string | number
}

/**
 * Fetch all shopping sessions
 * @returns Query result with sessions array
 */
export function useSessions(): UseQueryResult<ShoppingSession[], Error> {
  return useQuery({
    queryKey: ['shopping', 'sessions'],
    queryFn: shoppingService.getAllSessions,
  })
}

/**
 * Fetch the active shopping session
 * @returns Query result with active session or null
 */
export function useActiveSession(): UseQueryResult<ShoppingSession | null, Error> {
  return useQuery({
    queryKey: ['shopping', 'session', 'active'],
    queryFn: shoppingService.getActiveSession,
  })
}

/**
 * Fetch shopping items with filters
 * @param params - Query parameters
 * @returns Query result with items array
 */
export function useShoppingItems(params: ShoppingItemsParams = {}): UseQueryResult<ShoppingItem[], Error> {
  return useQuery({
    queryKey: ['shopping', 'items', params],
    queryFn: () => shoppingService.getItems(params),
  })
}

/**
 * Create a new shopping session
 * @returns Mutation for creating sessions
 */
export function useCreateSession(): UseMutationResult<ShoppingSession, Error, void> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: shoppingService.createSession,
    onSuccess: () => {
      // Invalidate active session and items queries
      queryClient.invalidateQueries({ queryKey: ['shopping', 'session', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Finish a shopping session
 * @returns Mutation for finishing sessions
 */
export function useFinishSession(): UseMutationResult<ShoppingSession, Error, string | number> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: shoppingService.finishSession,
    onSuccess: () => {
      // Invalidate active session, sessions list, and items queries
      queryClient.invalidateQueries({ queryKey: ['shopping', 'session', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['shopping', 'sessions'] })
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Reactivate a shopping session
 * @returns Mutation for reactivating sessions
 */
export function useReactivateSession(): UseMutationResult<ShoppingSession, Error, string | number> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: shoppingService.reactivateSession,
    onSuccess: () => {
      // Invalidate active session, sessions list, and items queries
      queryClient.invalidateQueries({ queryKey: ['shopping', 'session', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['shopping', 'sessions'] })
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Delete a shopping session
 * @returns Mutation for deleting sessions
 */
export function useDeleteSession(): UseMutationResult<void, Error, string | number> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: shoppingService.deleteSession,
    onSuccess: () => {
      // Invalidate active session, sessions list, and items queries
      queryClient.invalidateQueries({ queryKey: ['shopping', 'session', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['shopping', 'sessions'] })
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Uncheck all items in a session (return to backlog)
 * @returns Mutation for unchecking session items
 */
export function useUncheckSessionItems(): UseMutationResult<void, Error, string | number> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: shoppingService.uncheckSessionItems,
    onSuccess: () => {
      // Invalidate items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Delete all items in a session
 * @returns Mutation for deleting session items
 */
export function useDeleteSessionItems(): UseMutationResult<void, Error, string | number> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: shoppingService.deleteSessionItems,
    onSuccess: () => {
      // Invalidate items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Add item to shopping backlog
 * @returns Mutation for adding items
 */
export function useAddItem(): UseMutationResult<ShoppingItem, Error, string | number> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: shoppingService.addItem,
    onSuccess: () => {
      // Invalidate items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Check an item (mark as added to cart/session)
 * @returns Mutation for checking items
 */
export function useCheckItem(): UseMutationResult<ShoppingItem, Error, string | number> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: shoppingService.checkItem,
    onSuccess: () => {
      // Invalidate items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Uncheck an item (remove from cart/session)
 * @returns Mutation for unchecking items
 */
export function useUncheckItem(): UseMutationResult<ShoppingItem, Error, string | number> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: shoppingService.uncheckItem,
    onSuccess: () => {
      // Invalidate items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Delete a shopping item
 * @returns Mutation for deleting items
 */
export function useDeleteItem(): UseMutationResult<void, Error, string | number> {
  const queryClient = useQueryClient()

  return useOfflineMutation({
    mutationFn: shoppingService.deleteItem,
    onSuccess: () => {
      // Invalidate items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}
