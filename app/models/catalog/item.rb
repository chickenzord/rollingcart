module Catalog
  class Item < ApplicationRecord
    belongs_to :account
    belongs_to :category, class_name: "Catalog::Category", foreign_key: :category_id

    validates :name, presence: true
  end
end
