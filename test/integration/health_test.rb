require "test_helper"

class HealthTest < ActionDispatch::IntegrationTest
  test "liveness responds ok" do
    get "/api/health/live"

    assert_response :ok
    assert_equal({ "status" => "ok" }, json_response)
  end

  test "liveness reports the deployed revision when it is set" do
    ENV["APP_REVISION"] = "abc123"
    get "/api/health/live"

    assert_response :ok
    assert_equal({ "status" => "ok", "revision" => "abc123" }, json_response)
  ensure
    ENV.delete("APP_REVISION")
  end

  test "liveness does not touch the database" do
    ActiveRecord::Base.stub(:connection_pool, -> { raise "database should not be used" }) do
      get "/api/health/live"
    end

    assert_response :ok
  end

  test "readiness responds ok when the database is reachable" do
    get "/api/health/ready"

    assert_response :ok
    assert_equal({ "status" => "ok", "checks" => { "database" => "ok" } }, json_response)
  end

  test "readiness responds 503 without leaking details when the database is unavailable" do
    failure = -> { raise ActiveRecord::ConnectionNotEstablished, "connection to server at 10.0.0.5 failed for user secret_user" }

    ActiveRecord::Base.stub(:connection_pool, failure) do
      get "/api/health/ready"
    end

    assert_response :service_unavailable
    assert_equal({ "status" => "unavailable", "checks" => { "database" => "unavailable" } }, json_response)
    assert_no_match(/secret_user|10\.0\.0\.5/, response.body)
  end
end
