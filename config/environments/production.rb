require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.enable_reloading = false

  # Eager load code on boot for better performance and memory savings (ignored by Rake tasks).
  config.eager_load = true

  # Full error reports are disabled.
  config.consider_all_requests_local = false

  # Cache assets for far-future expiry since they are all digest stamped.
  config.public_file_server.headers = { "cache-control" => "public, max-age=#{1.year.to_i}" }

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.asset_host = "http://assets.example.com"

  # Hosting platforms terminate TLS at their proxy. Set RAILS_FORCE_SSL=false only when
  # running the production image locally over plain HTTP (avoids HSTS on localhost).
  force_ssl = ENV.fetch("RAILS_FORCE_SSL", "true") != "false"

  # Assume all access to the app is happening through a SSL-terminating reverse proxy.
  # This also means plain-HTTP health probes from the platform are not redirected.
  config.assume_ssl = force_ssl

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = force_ssl

  # Log to STDOUT with the current request id as a default log tag.
  config.log_tags = [ :request_id ]
  config.logger   = ActiveSupport::TaggedLogging.logger(STDOUT)

  # Change to "debug" to log everything (including potentially personally-identifiable information!).
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  # Prevent health checks from clogging up the logs.
  config.silence_healthcheck_path = "/api/health/live"

  # Don't log any deprecations.
  config.active_support.report_deprecations = false

  # Replace the default in-process memory cache store with a durable alternative.
  # config.cache_store = :mem_cache_store

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  # Only use :id for inspections in production.
  config.active_record.attributes_for_inspect = [ :id ]

  # Enable DNS rebinding protection when APP_HOSTS is set (comma-separated, e.g. "api.example.com").
  # Health checks are excluded because platforms probe the container by internal IP.
  health_check = ->(request) { request.path.start_with?("/api/health/") }
  app_hosts = ENV.fetch("APP_HOSTS", "").split(",").map(&:strip).reject(&:empty?)
  if app_hosts.any?
    config.hosts.concat(app_hosts)
    config.host_authorization = { exclude: health_check }
  end
end
