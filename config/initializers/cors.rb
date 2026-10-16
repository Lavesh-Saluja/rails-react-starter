# Cross-Origin Resource Sharing for a frontend hosted on a different origin.
#
# In development the Vite dev server proxies /api to Rails, so the browser sees a
# single origin and no CORS headers are needed. In production set CORS_ORIGINS to
# the exact frontend origin(s), comma-separated, e.g. "https://app.example.com".
# Leaving it empty disables cross-origin access entirely.
cors_origins = ENV.fetch("CORS_ORIGINS", "").split(",").map(&:strip).reject(&:empty?)

if cors_origins.any?
  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins(*cors_origins)

      resource "/api/*",
        headers: :any,
        methods: %i[get post put patch delete options head],
        max_age: 600
    end
  end
end
