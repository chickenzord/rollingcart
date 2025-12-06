# Sentry Error Tracking Configuration for Rails Backend
#
# Compatible with:
# - Sentry.io (SaaS)
# - GlitchTip (self-hosted)
# - Any Sentry-compatible error tracking service
#
# Environment Variables:
# - SENTRY_DSN_API: Sentry DSN specifically for backend/API errors
# - SENTRY_DSN: Default DSN if SENTRY_DSN_API not set
# - SENTRY_ENVIRONMENT: Override environment name (defaults to Rails.env)
# - APP_VERSION: Application version for release tracking
# - GIT_COMMIT: Git commit hash for release tracking
#
# If all DSN variables are empty, Sentry will not be initialized.
# Determine DSN with fallback logic
sentry_dsn = ENV["SENTRY_DSN_API"].presence || ENV["SENTRY_DSN"].presence

if sentry_dsn
  Sentry.init do |config|
    config.dsn = sentry_dsn
    config.breadcrumbs_logger = [ :active_support_logger, :http_logger ]

    # Environment and release tracking
    config.environment = ENV.fetch("SENTRY_ENVIRONMENT", Rails.env)

    # Determine release version with proper fallback
    config.release = if ENV["APP_VERSION"].present?
      ENV["APP_VERSION"]
    elsif ENV["GIT_COMMIT"].present?
      "dev-#{ENV['GIT_COMMIT']}"
    else
      "unknown"
    end

    # Set traces_sample_rate to capture performance monitoring
    # 1.0 means 100% of transactions, 0.1 means 10%
    config.traces_sample_rate = Rails.env.production? ? 0.1 : 1.0

    # Filter sensitive data
    config.send_default_pii = false # Don't send personally identifiable information

    # Ignore certain exceptions
    config.excluded_exceptions += [
      "ActionController::RoutingError",
      "ActiveRecord::RecordNotFound",
      "ActionController::InvalidAuthenticityToken",
      "Rodauth::InvalidAuthenticityTokenError",
    ]

    # Configure which request data to send
    config.send_modules = true # Send list of loaded modules

    # Custom error processing before sending to Sentry
    config.before_send = lambda do |event, hint|
      # Filter sensitive parameters
      if event.request&.data
        Rails.application.config.filter_parameters.each do |param|
          event.request.data.delete(param.to_s)
        end
      end

      # Add custom context if needed
      if event.request && hint[:exception]&.respond_to?(:record)
        event.request.data ||= {}
        event.request.data[:params] = hint[:exception].record.attributes
      end

      event
    end

    Rails.logger.warn "Sentry initialized (environment: #{config.environment}, release: #{config.release})"
  end
else
  Rails.logger.warn "Sentry not configured (no DSN found), error tracking disabled for backend"
end
