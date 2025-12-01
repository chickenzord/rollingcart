import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tailwindcss from '@tailwindcss/vite';
import RailsPlugin from 'vite-plugin-rails'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },
  plugins: [
    devtools(),
    tailwindcss(),
    RailsPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      strategies: 'generateSW',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'android-chrome-*.png', 'screenshot_*.png'],
      manifest: {
        name: 'RollingCart',
        short_name: 'RollingCart',
        description: 'Shopping list optimized for recurring grocery runs',
        theme_color: '#0d9488',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        id: '/',
        start_url: '/',
        scope: '/',
        screenshots: [
          {
            src: '/screenshot_01.png',
            sizes: '1080x1920',
            type: 'image/png',
          },
        ],
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        runtimeCaching: [
          // Auth endpoints - NetworkOnly (no cache for security)
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/auth/'),
            handler: 'NetworkOnly',
          },

          // User profile - NetworkFirst with 1h cache
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/me'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-user-profile',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // Shopping items - NetworkFirst with 24h cache (before sessions to catch /sessions/123/items)
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/shopping/items'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-shopping-items',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // Shopping sessions - NetworkFirst with 24h cache
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/shopping/sessions'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-shopping-sessions',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // Catalog items - NetworkFirst with 7-day cache (before categories to catch /categories/123/items)
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/catalog/items'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-catalog-items',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // Catalog categories - NetworkFirst with 7-day cache
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/catalog/categories'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-catalog-categories',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // Google Fonts - CacheFirst (unchanged)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/',
      },
    }),
  ]
})
