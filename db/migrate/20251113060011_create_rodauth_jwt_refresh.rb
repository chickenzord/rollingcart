class CreateRodauthJwtRefresh < ActiveRecord::Migration[8.0]
  def change
    # Used by the jwt refresh feature
    create_table :account_jwt_refresh_keys do |t|
      t.references :account, foreign_key: true, null: false
      t.string :key, null: false
      t.datetime :deadline, null: false
    end
  end
end
