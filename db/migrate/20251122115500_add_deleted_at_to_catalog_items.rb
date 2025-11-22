class AddDeletedAtToCatalogItems < ActiveRecord::Migration[8.1]
  def change
    add_column :catalog_items, :deleted_at, :datetime
    add_index :catalog_items, :deleted_at
  end
end
