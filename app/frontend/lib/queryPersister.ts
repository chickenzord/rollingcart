import { get, set, del } from 'idb-keyval'
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client'

const IDB_KEY = 'rollingcart-query-cache'
const CACHE_VERSION = 1 // Increment to invalidate old caches

interface StoredCache {
  version: number
  timestamp: number
  buster: string
  clientState: PersistedClient['clientState']
}

/**
 * Custom persister for TanStack Query using IndexedDB
 * Stores dehydrated query cache with versioning and filtering
 */
export const queryPersister: Persister = {
  persistClient: async (persistedClient: PersistedClient) => {
    try {
      // Filter out auth/user queries from the dehydrated state
      const filteredQueries = persistedClient.clientState.queries.filter(query => {
        const queryKey = query.queryKey
        const hasAuth = queryKey.some(key =>
          typeof key === 'string' && (key.includes('auth') || key.includes('user')),
        )
        // Only persist successful queries that aren't auth-related
        return !hasAuth && query.state.status === 'success'
      })

      const filteredClient: PersistedClient = {
        ...persistedClient,
        clientState: {
          ...persistedClient.clientState,
          queries: filteredQueries,
        },
      }

      const storedCache: StoredCache = {
        version: CACHE_VERSION,
        timestamp: Date.now(),
        buster: persistedClient.buster,
        clientState: filteredClient.clientState,
      }

      await set(IDB_KEY, storedCache)
    } catch (error) {
      console.error('Failed to persist client:', error)
    }
  },

  restoreClient: async (): Promise<PersistedClient | undefined> => {
    try {
      const stored = await get<StoredCache>(IDB_KEY)

      // Version check - invalidate if mismatched or too old
      if (!stored || stored.version !== CACHE_VERSION) {
        await del(IDB_KEY)
        return
      }

      // Check age - max 7 days
      const age = Date.now() - stored.timestamp
      const maxAge = 1000 * 60 * 60 * 24 * 7
      if (age > maxAge) {
        await del(IDB_KEY)
        return
      }

      return {
        buster: stored.buster,
        timestamp: stored.timestamp,
        clientState: stored.clientState,
      }
    } catch (error) {
      console.error('Failed to restore client:', error)
      return undefined
    }
  },

  removeClient: async () => {
    try {
      await del(IDB_KEY)
    } catch (error) {
      console.error('Failed to remove client:', error)
    }
  },
}
