/**
 * Sentry Error Tracking Configuration
 *
 * Compatible with:
 * - Sentry SaaS (sentry.io)
 * - GlitchTip (self-hosted Sentry alternative)
 * - Any Sentry-compatible error tracking service
 *
 * Configuration is injected at runtime via meta tags from Rails,
 * allowing Docker images to be built once and configured per environment.
 */

import * as Sentry from '@sentry/react'

/**
 * Read Sentry configuration from meta tags
 */
function getSentryConfig() {
  const dsn = document.querySelector<HTMLMetaElement>('meta[name="sentry-dsn"]')?.content
  const environment = document.querySelector<HTMLMetaElement>('meta[name="sentry-environment"]')?.content
  const version = document.querySelector<HTMLMetaElement>('meta[name="app-version"]')?.content

  return {
    dsn: dsn && dsn.trim() !== '' ? dsn : null,
    environment: environment || 'unknown',
    version: version || 'dev',
  }
}

/**
 * Initialize Sentry error tracking
 *
 * This function is safe to call even if Sentry is not configured.
 * If no DSN is provided, Sentry will not be initialized.
 *
 * @returns true if Sentry was initialized, false otherwise
 */
export function initSentry(): boolean {
  const config = getSentryConfig()

  // Skip initialization if no DSN is configured
  if (!config.dsn) {
    console.info('Sentry not configured (no DSN found), error tracking disabled')
    return false
  }

  try {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.version,

      // Integrations
      integrations: [
        // Browser tracing for performance monitoring
        Sentry.browserTracingIntegration({
          // Track React Router navigation
          enableInp: true,
        }),
        // Replay integration for session replay (optional, can be expensive)
        // Uncomment if you want session replay:
        // Sentry.replayIntegration({
        //   maskAllText: false,
        //   blockAllMedia: false,
        // }),
      ],

      // Performance Monitoring
      tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

      // Session Replay (if enabled above)
      // replaysSessionSampleRate: 0.1, // 10% of sessions
      // replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

      // Error filtering
      beforeSend(event, hint) {
        // Filter out certain errors if needed
        const error = hint.originalException

        // Ignore network errors from offline mode (we handle these gracefully)
        if (error instanceof Error && error.message.includes('offline')) {
          return null
        }

        return event
      },

      // Ignore certain URLs
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        // Random plugins/extensions
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        // Network errors we handle gracefully
        'NetworkError',
        'Failed to fetch',
      ],
    })

    console.info(`Sentry initialized (environment: ${config.environment}, version: ${config.version})`)
    return true
  } catch (error) {
    console.error('Failed to initialize Sentry:', error)
    return false
  }
}

/**
 * Set user context for error tracking
 * Call this after user logs in
 */
export function setSentryUser(user: { id: number; email: string } | null) {
  if (!user) {
    Sentry.setUser(null)
    return
  }

  Sentry.setUser({
    id: user.id.toString(),
    email: user.email,
  })
}

/**
 * Manually capture an exception
 * Use this for caught errors that you want to track
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value)
      })
      Sentry.captureException(error)
    })
  } else {
    Sentry.captureException(error)
  }
}

/**
 * Add breadcrumb for debugging
 * Breadcrumbs are logged events that lead up to an error
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    level: 'info',
    data,
  })
}
