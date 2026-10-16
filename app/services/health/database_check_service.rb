module Health
  # Readiness check: true when the database answers a trivial query, false otherwise.
  class DatabaseCheckService
    def process!
      ActiveRecord::Base.connection_pool.with_connection { |connection| connection.select_value("SELECT 1") }
      true
    rescue ActiveRecord::ActiveRecordError, PG::Error => error
      # Log the class only: connection error messages can include host names and user names.
      Rails.logger.error("Readiness check failed: #{error.class}")
      false
    end
  end
end
