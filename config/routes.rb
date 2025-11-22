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

      namespace :catalog do
        resources :categories, only: [ :index, :show, :create, :update, :destroy ] do
          get "items", to: "categories#items_index"
        end
        resources :items, only: [ :index, :show, :create, :update, :destroy ] do
          member do
            get :shopping_sessions
          end
        end
      end

      namespace :shopping do
        resources :sessions do
          collection do
            get :active
          end
          member do
            patch :finish
            post "items/uncheck", to: "sessions#uncheck_items"
            delete :items, to: "sessions#delete_items"
          end
        end
        resources :items do
          member do
            patch :check
            patch :uncheck
          end
        end
      end
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # React app handles all frontend routing
  root "pages#index"

  # Catch-all route: serve React app for all non-API routes
  # This allows React Router to handle client-side routing (/login, /dashboard, etc.)
  get "*path", to: "pages#index", constraints: ->(req) {
    # Don't catch API routes or Rails health check
    !req.path.start_with?("/auth/", "/api/", "/up", "/rails", "/vite-dev")
  }
end
