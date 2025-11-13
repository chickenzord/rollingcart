module Catalog
  class Item < ApplicationRecord
    self.table_name = "catalog_items"

    belongs_to :account
    belongs_to :category, class_name: "Catalog::Category", foreign_key: :category_id

    validates :name, presence: true
  end
end
