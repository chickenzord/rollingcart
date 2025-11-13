class CreateShoppingSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :shopping_sessions do |t|
      t.references :account, null: false, foreign_key: true
      t.string :name
      t.boolean :active, default: false

      t.timestamps
    end
  end
end
