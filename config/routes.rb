Rails.application.routes.draw do
  # Mount Rodauth authentication routes at /auth
  # Provides JWT-based authentication endpoints:
  # - POST /auth/login (get JWT token)
  # - POST /auth/logout (invalidate JWT)
  # - POST /auth/jwt-refresh (refresh JWT token)
  # - GET /auth/jwt-whoami (verify current user)
  # - POST /auth/reset-password-request
  # - POST /auth/reset-password
  # - POST /auth/change-password
  # - POST /auth/change-login
  mount RodauthApp, at: "/auth"

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # API v1 endpoints
  namespace :api do
    namespace :v1 do
      get "me", to: "accounts#me"
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
