# Controllers stay thin: authorize with a policy, call a service, render a Jbuilder view.
class ApplicationController < ActionController::API
  include Pundit::Authorization
  include ApiResponders
  include ApiRescuable

  # Fails loudly (Pundit::AuthorizationNotPerformedError) if an action forgets to authorize.
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  private
    # Placeholder until authentication is added; Pundit passes it to every policy.
    def current_user
      nil
    end
end
