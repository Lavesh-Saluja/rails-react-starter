require "test_helper"

class SampleItemsApiTest < ActionDispatch::IntegrationTest
  setup do
    @item = create(:sample_item, name: "Notebook", description: "A ruled notebook", created_at: 2.days.ago)
  end

  test "lists items newest first" do
    newer = create(:sample_item, created_at: 1.day.ago)

    get "/api/sample_items"

    assert_response :ok
    items = json_response["sample_items"]
    assert_equal [ newer.id, @item.id ], items.map { |item| item["id"] }
    assert_equal %w[created_at description id name updated_at], items.first.keys.sort
  end

  test "shows an item" do
    get "/api/sample_items/#{@item.id}"

    assert_response :ok
    item = json_response["sample_item"]
    assert_equal @item.id, item["id"]
    assert_equal "Notebook", item["name"]
    assert_equal "A ruled notebook", item["description"]
  end

  test "returns 404 for a missing item" do
    get "/api/sample_items/0"

    assert_response :not_found
    assert_equal({ "error" => "Not found" }, json_response)
  end

  test "creates an item" do
    assert_difference "SampleItem.count", 1 do
      post "/api/sample_items", params: { sample_item: { name: "Lamp", description: "Desk lamp" } }, as: :json
    end

    assert_response :created
    item = json_response["sample_item"]
    assert_equal "Lamp", item["name"]
    assert_equal "Desk lamp", SampleItem.find(item["id"]).description
  end

  test "rejects an invalid item with validation details" do
    assert_no_difference "SampleItem.count" do
      post "/api/sample_items", params: { sample_item: { name: "" } }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Validation failed", json_response["error"]
    assert_equal [ "can't be blank" ], json_response.dig("details", "name")
  end

  test "rejects a request without item parameters" do
    post "/api/sample_items", params: { unexpected: "value" }, as: :json

    assert_response :bad_request
    assert_match(/sample_item/, json_response["error"])
  end

  test "rejects malformed JSON" do
    post "/api/sample_items", params: "{not json", headers: { "CONTENT_TYPE" => "application/json" }

    assert_response :bad_request
    assert_equal({ "error" => "Malformed request body" }, json_response)
  end

  test "ignores attributes that are not permitted" do
    post "/api/sample_items", params: { sample_item: { name: "Lamp", id: 999_999 } }, as: :json

    assert_response :created
    assert_not_equal 999_999, json_response.dig("sample_item", "id")
  end

  test "updates an item with PATCH" do
    patch "/api/sample_items/#{@item.id}", params: { sample_item: { name: "Sketchbook" } }, as: :json

    assert_response :ok
    assert_equal "Sketchbook", json_response.dig("sample_item", "name")
    assert_equal "A ruled notebook", @item.reload.description
  end

  test "updates an item with PUT" do
    put "/api/sample_items/#{@item.id}", params: { sample_item: { name: "Journal", description: "" } }, as: :json

    assert_response :ok
    assert_equal "Journal", @item.reload.name
  end

  test "rejects an invalid update" do
    patch "/api/sample_items/#{@item.id}", params: { sample_item: { name: " " } }, as: :json

    assert_response :unprocessable_content
    assert_equal "Notebook", @item.reload.name
  end

  test "returns 404 when updating a missing item" do
    patch "/api/sample_items/0", params: { sample_item: { name: "Ghost" } }, as: :json

    assert_response :not_found
  end

  test "deletes an item" do
    assert_difference "SampleItem.count", -1 do
      delete "/api/sample_items/#{@item.id}"
    end

    assert_response :no_content
    assert_empty response.body
  end

  test "returns 404 when deleting a missing item" do
    delete "/api/sample_items/0"

    assert_response :not_found
  end

  test "returns 403 when the policy denies the action" do
    denying_policy = SampleItemPolicy.new(nil, @item)
    denying_policy.define_singleton_method(:destroy?) { false }

    SampleItemPolicy.stub(:new, denying_policy) do
      assert_no_difference "SampleItem.count" do
        delete "/api/sample_items/#{@item.id}"
      end
    end

    assert_response :forbidden
    assert_equal({ "error" => "You are not allowed to perform this action" }, json_response)
  end
end
