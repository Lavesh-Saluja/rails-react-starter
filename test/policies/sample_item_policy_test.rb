require "test_helper"

class SampleItemPolicyTest < ActiveSupport::TestCase
  setup do
    @sample_item = build(:sample_item)
  end

  test "the public sample allows every action without a user" do
    policy = SampleItemPolicy.new(nil, @sample_item)

    %i[index? show? create? update? destroy?].each do |action|
      assert policy.public_send(action), "expected #{action} to be allowed"
    end
  end

  test "scope returns all sample items" do
    items = create_list(:sample_item, 2)

    assert_equal items.map(&:id).sort, SampleItemPolicy::Scope.new(nil, SampleItem).resolve.pluck(:id).sort
  end

  test "the application policy denies everything by default" do
    policy = ApplicationPolicy.new(nil, @sample_item)

    %i[index? show? create? update? destroy?].each do |action|
      assert_not policy.public_send(action), "expected #{action} to be denied"
    end
  end
end
