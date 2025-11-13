class CreateCatalogCategories < ActiveRecord::Migration[8.0]
  def change
    create_table :catalog_categories do |t|
      t.references :account, null: false, foreign_key: true, index: true
      t.string :name, null: false

      t.timestamps
    end
  end
end
