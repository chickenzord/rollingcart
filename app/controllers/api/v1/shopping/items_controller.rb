class Api::V1::Shopping::ItemsController < Api::BaseController
  before_action :authenticate
  before_action :set_item, only: [ :show, :update, :destroy, :check, :uncheck ]

  def index
    if item_index_params[:for_session]
      items = current_account.shopping_items.for_session(item_index_params[:for_session])
    elsif item_index_params[:is_done]
      items = current_account.shopping_items.is_done(item_index_params[:is_done] == "true")
    else
      items = current_account.shopping_items
    end

    render json: items,
      only: [ :id, :notes, :created_at ],
      methods: [ :name, :description, :done? ],
      include: {
        category: { only: [ :id, :name ] }
      }
  end

  def show
    render json: @item
  end

  def create
    item = current_account.shopping_items.build({
      catalog_item_id: item_create_params[:catalog_item_id],
      notes: item_create_params[:notes]
    })

    if item.save
      render json: item, status: :created
    else
      render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @item.update(item_update_params)
      render json: @item
    else
      render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @item.destroy
    head :no_content
  end

  def check
    active_session = current_account.shopping_sessions.active.first

    if active_session.nil?
      render json: { error: "No active session found" }, status: :unprocessable_entity
      return
    end

    if @item.update(shopping_session_id: active_session.id)
      render json: @item
    else
      render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def uncheck
    if @item.update(shopping_session_id: nil)
      render json: @item
    else
      render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def authenticate
    rodauth.require_authentication
  rescue Rodauth::Rails::Error
    render json: { error: "Unauthorized" }, status: :unauthorized
  end

  def set_item
    @item = current_account.shopping_items.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Item not found" }, status: :not_found
  end

  def item_index_params
    params.permit(:for_session, :is_done, :item)
  end

  def item_create_params
    params.require(:catalog_item_id).permit(:notes)
  end

  def item_update_params
    params.permit(:notes)
  end
end
