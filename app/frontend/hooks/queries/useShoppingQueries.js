/**
 * Custom hooks for shopping-related queries and mutations
 * Provides reusable TanStack Query hooks for shopping operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as shoppingService from '../../services/shoppingService'

/**
 * Fetch all shopping sessions
 * @returns {UseQueryResult} Query result with sessions array
 */
export function useSessions() {
  return useQuery({
    queryKey: ['shopping', 'sessions'],
    queryFn: shoppingService.getAllSessions,
  })
}

/**
 * Fetch the active shopping session
 * @returns {UseQueryResult} Query result with active session or null
 */
export function useActiveSession() {
  return useQuery({
    queryKey: ['shopping', 'session', 'active'],
    queryFn: shoppingService.getActiveSession,
  })
}

/**
 * Fetch shopping items with filters
 * @param {Object} params - Query parameters
 * @param {boolean} params.isDone - Filter by done status
 * @param {number} params.forSession - Filter by session ID
 * @returns {UseQueryResult} Query result with items array
 */
export function useShoppingItems(params = {}) {
  return useQuery({
    queryKey: ['shopping', 'items', params],
    queryFn: () => shoppingService.getItems(params),
  })
}

/**
 * Create a new shopping session
 * @returns {UseMutationResult} Mutation for creating sessions
 */
export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
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
 * @returns {UseMutationResult} Mutation for finishing sessions
 */
export function useFinishSession() {
  const queryClient = useQueryClient()

  return useMutation({
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
 * Delete a shopping session
 * @returns {UseMutationResult} Mutation for deleting sessions
 */
export function useDeleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
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
 * Add item to shopping backlog
 * @returns {UseMutationResult} Mutation for adding items
 */
export function useAddItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: shoppingService.addItem,
    onSuccess: () => {
      // Invalidate items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Check an item (mark as added to cart/session)
 * @returns {UseMutationResult} Mutation for checking items
 */
export function useCheckItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: shoppingService.checkItem,
    onSuccess: () => {
      // Invalidate items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Uncheck an item (remove from cart/session)
 * @returns {UseMutationResult} Mutation for unchecking items
 */
export function useUncheckItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: shoppingService.uncheckItem,
    onSuccess: () => {
      // Invalidate items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}

/**
 * Delete a shopping item
 * @returns {UseMutationResult} Mutation for deleting items
 */
export function useDeleteItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: shoppingService.deleteItem,
    onSuccess: () => {
      // Invalidate items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['shopping', 'items'] })
    },
  })
}
