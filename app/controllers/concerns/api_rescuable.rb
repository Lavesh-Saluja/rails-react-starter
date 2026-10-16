# Maps expected exceptions to JSON error responses (rendered by app/views/api/shared/error).
# Anything else falls through to Rails, which returns a generic 500 without details in production.
module ApiRescuable
  extend ActiveSupport::Concern

  included do
    rescue_from ActiveRecord::RecordNotFound, with: :handle_record_not_found
    rescue_from ActiveRecord::RecordInvalid, with: :handle_validation_error
    rescue_from ActionController::ParameterMissing, with: :handle_parameter_missing
    rescue_from ActionDispatch::Http::Parameters::ParseError, with: :handle_parse_error
    rescue_from Pundit::NotAuthorizedError, with: :handle_not_authorized
  end

  private
    def handle_record_not_found
      render_error(I18n.t("errors.not_found"), :not_found)
    end

    def handle_validation_error(exception)
      render_error(I18n.t("errors.validation_failed"), :unprocessable_content, exception.record.errors.to_hash)
    end

    def handle_parameter_missing(exception)
      render_error(I18n.t("errors.parameter_missing", param: exception.param), :bad_request)
    end

    def handle_parse_error
      render_error(I18n.t("errors.malformed_body"), :bad_request)
    end

    def handle_not_authorized
      render_error(I18n.t("errors.not_authorized"), :forbidden)
    end
end
