import { createRoot } from 'react-dom/client'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from '../components/App'
import { queryClient } from '../lib/queryClient'
import { queryPersister } from '../lib/queryPersister'
import { registerSW } from '../utils/registerServiceWorker'
import './application.css'

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root')
  if (container) {
    const root = createRoot(container)

    root.render(
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: queryPersister }}
      >
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </PersistQueryClientProvider>,
    )
  }

  // Register service worker for PWA functionality
  // Enabled in both dev and production for testing
  registerSW()
})
