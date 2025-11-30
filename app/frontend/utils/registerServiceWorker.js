/**
 * Manual Service Worker Registration
 * Uses vite-plugin-pwa with injectRegister: null for manual control
 */

export async function registerSW() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported in this browser')
    return null
  }

  try {
    // In development, vite-plugin-pwa serves the SW at /vite-dev/
    // In production, vite-ruby builds to /vite/
    // The server is configured to send Service-Worker-Allowed: / header
    const swPath = import.meta.env.DEV ? '/vite-dev/dev-sw.js?dev-sw' : '/vite/sw.js'

    const registration = await navigator.serviceWorker.register(swPath, {
      scope: '/',
      type: import.meta.env.DEV ? 'module' : 'classic',
    })

    // Handle updates - silently activate new service worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing

      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Auto-activate without user prompt
          newWorker.postMessage({ type: 'SKIP_WAITING' })
        }
      })
    })

    // Listen for controlling service worker change
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

export async function unregisterSW() {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      const success = await registration.unregister()
      console.warn('Service Worker unregistered:', success)
      return success
    }
    return false
  } catch (error) {
    console.error('Service Worker unregistration failed:', error)
    return false
  }
}
