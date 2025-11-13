class Account < ApplicationRecord
  include Rodauth::Rails.model
  enum :status, { unverified: 1, verified: 2, closed: 3 }

  has_many :catalog_categories, class_name: "Catalog::Category", dependent: :destroy
  has_many :catalog_items, class_name: "Catalog::Item", dependent: :destroy
  has_many :shopping_sessions, class_name: "Shopping::Session", dependent: :destroy
  has_many :shopping_items, class_name: "Shopping::Item", dependent: :destroy
end
