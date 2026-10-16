require "test_helper"

class SampleItems::ListServiceTest < ActiveSupport::TestCase
  test "returns items in the scope, newest first" do
    older = create(:sample_item, created_at: 2.days.ago)
    newer = create(:sample_item, created_at: 1.day.ago)

    assert_equal [ newer, older ], SampleItems::ListService.new(SampleItem.all).process!.to_a
  end

  test "respects the given scope" do
    included = create(:sample_item)
    create(:sample_item)

    assert_equal [ included ], SampleItems::ListService.new(SampleItem.where(id: included.id)).process!.to_a
  end
end
