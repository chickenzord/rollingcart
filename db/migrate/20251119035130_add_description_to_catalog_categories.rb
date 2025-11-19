class AddDescriptionToCatalogCategories < ActiveRecord::Migration[8.1]
  def change
    add_column :catalog_categories, :description, :text
  end
end
