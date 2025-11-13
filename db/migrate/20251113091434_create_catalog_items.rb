class CreateCatalogItems < ActiveRecord::Migration[8.0]
  def change
    create_table :catalog_items do |t|
      t.references :account, null: false, foreign_key: true, index: true
      t.references :category, null: false, foreign_key: { to_table: :catalog_categories }, index: true
      t.string :name, null: false
      t.text :notes

      t.timestamps
    end
  end
end
