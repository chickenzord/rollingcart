class Api::V1::Shopping::SessionsController < Api::BaseController
  before_action :authenticate
  before_action :set_session, only: [ :show, :update, :destroy, :finish ]

  def index
    sessions = current_account.shopping_sessions.order(created_at: :desc)
    render json: sessions
  end

  def show
    render json: @session
  end

  def active
    session = current_account.shopping_sessions.active.first
    Rails.logger.info("Active session: #{session.inspect}")
    if session
      render json: session
    else
      head :no_content
    end
  end

  def finish
    if @session.update(active: false)
      render json: @session
    else
      render json: { errors: @session.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def create
    session = current_account.shopping_sessions.build(session_params)

    if session.save
      render json: session, status: :created
    else
      render json: { errors: session.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @session.update(session_params)
      render json: @session
    else
      render json: { errors: @session.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @session.destroy
    head :no_content
  end

  private

  def authenticate
    rodauth.require_authentication
  rescue Rodauth::Rails::Error
    render json: { error: "Unauthorized" }, status: :unauthorized
  end

  def set_session
    @session = current_account.shopping_sessions.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Session not found" }, status: :not_found
  end

  def session_params
    params.require(:session).permit(:name, :active)
  end
end
