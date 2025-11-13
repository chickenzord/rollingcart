class Api::BaseController < ApplicationController
  # Skip CSRF token verification for API endpoints
  # API uses JWT authentication via Authorization header, which is not vulnerable to CSRF
  skip_before_action :verify_authenticity_token
end
