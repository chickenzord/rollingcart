/**
 * TanStack Query Client Configuration
 * Provides sensible defaults for all queries and mutations in the app
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: How long data is considered fresh (5 minutes)
      // Fresh data won't refetch on component mount
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Cache time: How long unused data stays in cache (10 minutes)
      // After this, data is garbage collected
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Retry failed requests (useful for transient network errors)
      retry: 1,

      // Refetch on window focus (keep data fresh when user returns)
      refetchOnWindowFocus: true,

      // Refetch on reconnect (sync data after going offline)
      refetchOnReconnect: true,

      // Don't refetch on mount if data is still fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,

      // Don't show errors in console by default (handle in components)
      throwOnError: false,
    },
  },
})
