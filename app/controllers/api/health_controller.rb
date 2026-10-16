module Api
  # Public probes for the hosting platform; they have no records to authorize.
  class HealthController < ApplicationController
    skip_after_action :verify_authorized, :verify_policy_scoped

    # Liveness: the process can serve a request. Never touches the database.
    # Also reports the deployed commit (APP_REVISION, baked into the image) when known.
    def live
      @revision = ENV["APP_REVISION"].presence
    end

    # Readiness: the app can serve real traffic, which requires the database.
    def ready
      @database_ready = Health::DatabaseCheckService.new.process!
      render status: @database_ready ? :ok : :service_unavailable
    end
  end
end
