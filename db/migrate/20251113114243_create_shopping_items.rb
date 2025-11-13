class CreateShoppingItems < ActiveRecord::Migration[8.0]
  def change
    create_table :shopping_items do |t|
      t.references :account, null: false, foreign_key: true
      t.references :catalog_item, null: false, foreign_key: true
      t.references :shopping_session, null: true, foreign_key: true
      t.string :notes

      t.timestamps
    end
  end
end
