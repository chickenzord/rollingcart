import { useMutation } from '@tanstack/react-query'
import { useOfflineDisabled } from './useOfflineDisabled'
import { useFlash } from '../contexts/FlashContext'

/**
 * Wrapper around useMutation that handles offline behavior
 *
 * When offline:
 * - Current: Shows error message and blocks mutation
 * - Future (Phase 3): Queue mutation for background sync
 *
 * Usage:
 * ```js
 * const mutation = useOfflineMutation({
 *   mutationFn: (data) => api.post('/items', data),
 *   onSuccess: () => queryClient.invalidateQueries(['items'])
 * })
 * ```
 *
 * @param {Object} options - Standard useMutation options
 * @param {Function} options.mutationFn - The mutation function to execute
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {Function} [options.onSettled] - Settled callback
 * @returns {Object} mutation object with offline handling
 */
export function useOfflineMutation(options) {
  const { isOffline } = useOfflineDisabled()
  const { flash } = useFlash()

  return useMutation({
    ...options,
    mutationFn: async (...args) => {
      // Check offline status before mutation
      if (isOffline) {
        // Current behavior: Block and show error
        flash.warning('No internet connection')
        throw new Error('Cannot perform action while offline')

        // Future (Phase 3): Queue mutation instead
        // Uncomment these lines and import mutationQueue:
        //
        // import { mutationQueue } from '../lib/mutationQueue'
        //
        // await mutationQueue.enqueue({
        //   mutationFn: options.mutationFn,
        //   variables: args[0]
        // })
        // flash.info('Action queued for when you're back online')
        // return { queued: true }
      }

      // Online: Execute normally
      return options.mutationFn(...args)
    },
  })
}
