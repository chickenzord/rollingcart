module Api
  module V1
    module Catalog
      class ItemsController < Api::BaseController
        before_action :authenticate
        before_action :set_item, only: [ :show, :update, :destroy ]

        def index
          items = current_account.catalog_items

          # Conditionally include category based on query parameter
          if include_category?
            items = items.includes(:category)
            render json: items, include: { category: { only: [ :id, :name ] } }
          else
            render json: items
          end
        end

        def show
          render json: @item, include: :category
        end

        def create
          item = current_account.catalog_items.build(item_params)

          if item.save
            # If add_to_shopping flag is set, also create a shopping item
            if params[:add_to_shopping] == "true"
              shopping_item = current_account.shopping_items.build(
                catalog_item_id: item.id,
                notes: nil
              )

              if shopping_item.save
                render json: shopping_item,
                  only: [ :id, :notes, :created_at, :catalog_item_id ],
                  methods: [ :name, :description, :done? ],
                  include: { category: { only: [ :id, :name ] } },
                  status: :created
              else
                render json: { errors: shopping_item.errors.full_messages }, status: :unprocessable_entity
              end
            else
              render json: item, include: :category, status: :created
            end
          else
            render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @item.update(item_params)
            render json: @item, include: :category
          else
            render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @item.destroy
          head :no_content
        end

        private

        def authenticate
          rodauth.require_authentication
        rescue Rodauth::Rails::Error
          render json: { error: "Unauthorized" }, status: :unauthorized
        end

        def set_item
          @item = current_account.catalog_items.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Item not found" }, status: :not_found
        end

        def item_params
          params.require(:item).permit(:name, :description, :category_id)
        end

        def include_category?
          params[:include_category].to_s.downcase == "true"
        end
      end
    end
  end
end
