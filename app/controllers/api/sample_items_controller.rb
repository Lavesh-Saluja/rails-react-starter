module Api
  class SampleItemsController < ApplicationController
    before_action :load_sample_item!, only: %i[show update destroy]

    def index
      @sample_items = SampleItems::ListService.new(policy_scope(SampleItem)).process!
    end

    def show
      authorize @sample_item
    end

    def create
      authorize SampleItem
      @sample_item = SampleItems::CreateService.new(sample_item_params).process!
      render :show, status: :created
    end

    def update
      authorize @sample_item
      SampleItems::UpdateService.new(@sample_item, sample_item_params).process!
      render :show
    end

    def destroy
      authorize @sample_item
      SampleItems::DestroyService.new(@sample_item).process!
      head :no_content
    end

    private
      def load_sample_item!
        @sample_item = SampleItem.find(params[:id])
      end

      def sample_item_params
        params.expect(sample_item: %i[name description])
      end
  end
end
