require "test_helper"

class SampleItems::DestroyServiceTest < ActiveSupport::TestCase
  test "deletes the sample item" do
    item = create(:sample_item)

    assert_difference("SampleItem.count", -1) do
      SampleItems::DestroyService.new(item).process!
    end
  end
end
