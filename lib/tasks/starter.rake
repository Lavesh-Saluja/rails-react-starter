namespace :starter do
  desc "Verify Ruby version, database connectivity, migrations and required production settings (read-only)"
  task check: :environment do
    failures = []
    report = ->(ok, label, hint = nil) do
      puts "#{ok ? "[ok]  " : "[FAIL]"} #{label}"
      failures << "#{label}: #{hint}" unless ok
    end

    expected_ruby = Rails.root.join(".ruby-version").read.strip
    report.(RUBY_VERSION == expected_ruby, "Ruby #{RUBY_VERSION} (expected #{expected_ruby})",
      "install Ruby #{expected_ruby} and select it with your version manager")

    database = ActiveRecord::Base.connection_db_config.database
    begin
      ActiveRecord::Base.connection_pool.with_connection { |connection| connection.select_value("SELECT 1") }
      report.(true, "Database '#{database}' is reachable")

      pending = ActiveRecord::Base.connection_pool.migration_context.needs_migration?
      report.(!pending, "Migrations are up to date", "run bin/rails db:migrate")
    rescue ActiveRecord::NoDatabaseError
      report.(false, "Database '#{database}' exists", "run bin/rails db:prepare")
    rescue ActiveRecord::ActiveRecordError, PG::Error => error
      report.(false, "Database '#{database}' is reachable",
        "#{error.class}; check that PostgreSQL is running and the DB_* / DATABASE_URL settings")
    end

    if Rails.env.production?
      %w[SECRET_KEY_BASE DATABASE_URL].each do |name|
        report.(ENV[name].present?, "#{name} is set", "set #{name} in the hosting platform's environment")
      end
      puts "[info] CORS_ORIGINS is empty: cross-origin browser requests are disabled" if ENV["CORS_ORIGINS"].blank?
    end

    if failures.any?
      warn "\n#{failures.size} check(s) failed:"
      failures.each { |failure| warn "  - #{failure}" }
      exit 1
    end

    puts "\nAll checks passed (#{Rails.env})."
  end
end
