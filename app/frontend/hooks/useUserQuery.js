/**
 * Custom hook for fetching current user data
 * Uses TanStack Query for caching and automatic refetching
 */

import { useQuery } from '@tanstack/react-query'
import { getMe } from '../services/authService'
import { hasValidTokens } from '../utils/tokenStorage'

export const USER_QUERY_KEY = ['user', 'me']

/**
 * Fetch current user data from /api/v1/me
 * Only runs if valid tokens exist in storage
 *
 * @returns {UseQueryResult} Query result with user data, loading, error states
 */
export function useUserQuery() {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: getMe,
    enabled: hasValidTokens(), // Only fetch if tokens exist
    staleTime: 5 * 60 * 1000, // 5 minutes - consider data fresh
    retry: false, // Don't retry - let api.js handle 401 errors and token refresh
    refetchOnWindowFocus: false, // Don't refetch on every focus - user data rarely changes
  })
}
