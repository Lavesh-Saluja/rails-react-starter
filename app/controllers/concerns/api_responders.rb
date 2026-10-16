module ApiResponders
  extend ActiveSupport::Concern

  private
    def render_error(message, status, details = {})
      render "api/shared/error", locals: { message:, details: }, status:, formats: :json
    end
end
