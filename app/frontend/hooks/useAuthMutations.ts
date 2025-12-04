/**
 * Custom hooks for authentication mutations
 * Handles login and logout with automatic cache management
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query'
import * as authService from '@/services/authService'
import type { User } from '@/services/authService'
import { USER_QUERY_KEY } from '@/hooks/useUserQuery'

interface LoginVariables {
  email: string
  password: string
}

/**
 * Login mutation
 * On success, stores tokens and populates user cache immediately
 *
 * @returns Mutation result with login function
 */
export function useLoginMutation(): UseMutationResult<User, Error, LoginVariables> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: LoginVariables) => authService.login(email, password),
    onSuccess: (userData) => {
      // Immediately populate user cache with fetched data
      // No need to refetch - we already have the user data from login
      queryClient.setQueryData(USER_QUERY_KEY, userData)
    },
    onError: () => {
      // Clear any stale user data from cache on login failure
      queryClient.removeQueries({ queryKey: USER_QUERY_KEY })
    },
  })
}

/**
 * Logout mutation
 * On completion (success or error), clears all cached data
 *
 * @returns Mutation result with logout function
 */
export function useLogoutMutation(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      // Always clear caches after logout attempt (even if API call fails)
      // This ensures local state is cleared regardless of server response
      queryClient.removeQueries({ queryKey: USER_QUERY_KEY })
      queryClient.clear() // Clear all queries (catalog, shopping, etc.)
    },
  })
}
