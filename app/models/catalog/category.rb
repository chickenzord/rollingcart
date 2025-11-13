module Catalog
  class Category < ApplicationRecord
    belongs_to :account
    has_many :items, class_name: "Catalog::Item", foreign_key: :category_id, dependent: :restrict_with_error

    validates :name, presence: true
  end
end
