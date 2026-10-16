module SampleItems
  # Updates a sample item. Raises ActiveRecord::RecordInvalid when validation fails.
  class UpdateService
    attr_reader :sample_item, :params

    def initialize(sample_item, params)
      @sample_item = sample_item
      @params = params
    end

    def process!
      sample_item.update!(params)
      sample_item
    end
  end
end
