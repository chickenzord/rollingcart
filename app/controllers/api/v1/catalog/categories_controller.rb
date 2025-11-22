module Api
  module V1
    module Catalog
      class CategoriesController < Api::BaseController
        before_action :authenticate
        before_action :set_category, only: [ :show, :update, :destroy, :items_index ]

        def index
          categories = current_account.catalog_categories.order(:name)
          render json: categories
        end

        def show
          render json: @category
        end

        def create
          category = current_account.catalog_categories.build(category_params)

          if category.save
            render json: category, status: :created
          else
            render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @category.update(category_params)
            render json: @category
          else
            render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @category.destroy
          head :no_content
        end

        def items_index
          items = @category.items

          # Conditionally include category based on query parameter
          if include_category?
            items = items.includes(:category)
            render json: items, include: { category: { only: [ :id, :name ] } }
          else
            render json: items
          end
        end

        private

        def authenticate
          rodauth.require_authentication
        rescue Rodauth::Rails::Error
          render json: { error: "Unauthorized" }, status: :unauthorized
        end

        def set_category
          category_id = params[:id] || params[:category_id]
          @category = current_account.catalog_categories.find(category_id)
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Category not found" }, status: :not_found
        end

        def category_params
          params.require(:category).permit(:name)
        end

        def include_category?
          params[:include_category].to_s.downcase == "true"
        end
      end
    end
  end
end
