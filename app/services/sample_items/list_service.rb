module SampleItems
  # Returns the sample items visible in `scope`, newest first.
  class ListService
    attr_reader :scope

    def initialize(scope)
      @scope = scope
    end

    def process!
      scope.order(created_at: :desc)
    end
  end
end
