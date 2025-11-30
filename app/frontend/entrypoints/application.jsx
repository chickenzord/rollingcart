import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from '../components/App'
import { queryClient } from '../lib/queryClient'
import { registerSW } from '../utils/registerServiceWorker'
import './application.css'

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root')
  if (container) {
    const root = createRoot(container)

    root.render(
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>,
    )
  }

  // Register service worker for PWA functionality
  // Enabled in both dev and production for testing
  registerSW()
})
