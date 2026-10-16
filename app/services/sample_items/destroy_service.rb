module SampleItems
  # Deletes a sample item. Raises ActiveRecord::RecordNotDestroyed if a callback aborts it.
  class DestroyService
    attr_reader :sample_item

    def initialize(sample_item)
      @sample_item = sample_item
    end

    def process!
      sample_item.destroy!
    end
  end
end
