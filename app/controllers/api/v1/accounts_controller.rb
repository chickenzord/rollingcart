class Api::V1::AccountsController < ApplicationController
  before_action :authenticate

  def me
    account = Account.find(rodauth.session_value)
    render json: {
      id: account.id,
      email: account.email,
      status: account.status
    }
  end

  private

  def authenticate
    # Verify JWT token
    rodauth.require_authentication
  rescue Rodauth::Rails::Error
    render json: { error: "Unauthorized" }, status: :unauthorized
  end
end
