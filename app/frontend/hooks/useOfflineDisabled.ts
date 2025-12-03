import { useOnlineStatus } from '@/hooks/useOnlineStatus'

interface OfflineDisabledResult {
  isOffline: boolean
  isDisabled: boolean
  disableReason: string | null
}

/**
 * Hook to check if mutations should be disabled due to offline status
 * @returns Object with offline status and disable reason
 */
export function useOfflineDisabled(): OfflineDisabledResult {
  const isOnline = useOnlineStatus()

  return {
    isOffline: !isOnline,
    isDisabled: !isOnline,
    disableReason: !isOnline ? 'No internet connection' : null,
  }
}
