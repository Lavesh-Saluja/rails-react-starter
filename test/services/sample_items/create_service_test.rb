require "test_helper"

class SampleItems::CreateServiceTest < ActiveSupport::TestCase
  test "creates a sample item" do
    item = assert_difference("SampleItem.count", 1) do
      SampleItems::CreateService.new(name: "Lamp", description: "Desk lamp").process!
    end

    assert item.persisted?
    assert_equal "Lamp", item.name
  end

  test "raises RecordInvalid and creates nothing when invalid" do
    assert_no_difference "SampleItem.count" do
      assert_raises(ActiveRecord::RecordInvalid) do
        SampleItems::CreateService.new(name: "").process!
      end
    end
  end
end
