import { useOnlineStatus } from './useOnlineStatus'

/**
 * Hook to check if mutations should be disabled due to offline status
 * @returns {Object} { isOffline: boolean, disableReason: string | null }
 */
export function useOfflineDisabled() {
  const isOnline = useOnlineStatus()

  return {
    isOffline: !isOnline,
    isDisabled: !isOnline,
    disableReason: !isOnline ? 'No internet connection' : null,
  }
}
