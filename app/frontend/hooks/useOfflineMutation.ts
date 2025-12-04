import { useMutation, UseMutationOptions, UseMutationResult, MutationFunction } from '@tanstack/react-query'
import { useOfflineDisabled } from '@/hooks/useOfflineDisabled'
import { useFlash } from '@/contexts/FlashContext'

/**
 * Wrapper around useMutation that handles offline behavior
 *
 * When offline:
 * - Current: Shows error message and blocks mutation
 * - Future (Phase 3): Queue mutation for background sync
 *
 * Usage:
 * ```ts
 * const mutation = useOfflineMutation({
 *   mutationFn: (data) => api.post('/items', data),
 *   onSuccess: () => queryClient.invalidateQueries(['items'])
 * })
 * ```
 *
 * @param options - Standard useMutation options
 * @returns mutation object with offline handling
 */
export function useOfflineMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { isOffline } = useOfflineDisabled()
  const { flash } = useFlash()

  const wrappedMutationFn: MutationFunction<TData, TVariables> = async (variables) => {
      // Check offline status before mutation
      if (isOffline) {
        // Current behavior: Block and show error
        flash.warning('No internet connection')
        throw new Error('Cannot perform action while offline')

        // Future (Phase 3): Queue mutation instead
        // Uncomment these lines and import mutationQueue:
        //
        // import { mutationQueue } from '@/lib/mutationQueue'
        //
        // await mutationQueue.enqueue({
        //   mutationFn: options.mutationFn,
        //   variables
        // })
        // flash.info('Action queued for when you're back online')
        // return { queued: true }
      }

      // Online: Execute normally
      if (!options.mutationFn) {
        throw new Error('mutationFn is required')
      }
      return options.mutationFn(variables, {} as any)
    }

  return useMutation({
    ...options,
    mutationFn: wrappedMutationFn,
  })
}
