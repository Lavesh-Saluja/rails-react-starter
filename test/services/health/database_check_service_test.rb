require "test_helper"

class Health::DatabaseCheckServiceTest < ActiveSupport::TestCase
  test "is true when the database answers" do
    assert Health::DatabaseCheckService.new.process!
  end

  test "is false when the database is unavailable" do
    ActiveRecord::Base.stub(:connection_pool, -> { raise ActiveRecord::ConnectionNotEstablished }) do
      assert_not Health::DatabaseCheckService.new.process!
    end
  end
end
