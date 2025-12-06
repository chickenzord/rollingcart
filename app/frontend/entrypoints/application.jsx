import { createRoot } from 'react-dom/client'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as Sentry from '@sentry/react'
import App from '../components/App'
import { queryClient } from '../lib/queryClient'
import { queryPersister } from '../lib/queryPersister'
import { registerSW } from '../utils/registerServiceWorker'
import { initSentry } from '../lib/sentry'
import './application.css'

// Initialize Sentry error tracking (if configured)
initSentry()

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root')
  if (container) {
    const root = createRoot(container)

    root.render(
      <Sentry.ErrorBoundary
        fallback={({ error, resetError }) => (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <div className="bg-error/10 border border-error/30 rounded-lg p-6">
                <h1 className="text-xl font-bold text-error mb-3">Application Error</h1>
                <p className="text-base-content mb-4">
                  Something went wrong. The error has been reported.
                </p>
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-base-content/60 hover:text-base-content">
                    Error details
                  </summary>
                  <pre className="mt-2 text-xs bg-base-200 p-3 rounded overflow-auto">
                    {error.message}
                  </pre>
                </details>
                <button onClick={resetError} className="btn btn-primary btn-sm">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      >
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister }}
        >
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </PersistQueryClientProvider>
      </Sentry.ErrorBoundary>,
    )
  }

  // Register service worker for PWA functionality
  // Enabled in both dev and production for testing
  registerSW()
})
