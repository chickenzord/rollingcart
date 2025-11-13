class ApplicationController < ActionController::Base
  private

  def current_account
    @current_account ||= Account.find(rodauth.session_value)
  end
end
