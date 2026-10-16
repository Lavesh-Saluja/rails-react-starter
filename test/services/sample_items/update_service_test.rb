require "test_helper"

class SampleItems::UpdateServiceTest < ActiveSupport::TestCase
  setup do
    @item = create(:sample_item, name: "Notebook")
  end

  test "updates and returns the sample item" do
    result = SampleItems::UpdateService.new(@item, name: "Sketchbook").process!

    assert_equal @item, result
    assert_equal "Sketchbook", @item.reload.name
  end

  test "raises RecordInvalid and keeps the stored values when invalid" do
    assert_raises(ActiveRecord::RecordInvalid) do
      SampleItems::UpdateService.new(@item, name: " ").process!
    end

    assert_equal "Notebook", @item.reload.name
  end
end
