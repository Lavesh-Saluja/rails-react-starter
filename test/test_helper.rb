ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "minitest/mock"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Build records with factories from test/factories, e.g. create(:sample_item)
    include FactoryBot::Syntax::Methods
  end
end

module ActionDispatch
  class IntegrationTest
    def json_response
      JSON.parse(response.body)
    end
  end
end
