Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    namespace :health do
      get :live
      get :ready
    end

    resources :sample_items, only: %i[index show create update destroy]
  end
end
