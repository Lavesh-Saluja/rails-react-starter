module SampleItems
  # Creates a sample item. Raises ActiveRecord::RecordInvalid when validation fails.
  class CreateService
    attr_reader :params

    def initialize(params)
      @params = params
    end

    def process!
      SampleItem.create!(params)
    end
  end
end
