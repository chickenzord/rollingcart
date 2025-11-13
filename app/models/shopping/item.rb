class Shopping::Item < ApplicationRecord
  belongs_to :account
  belongs_to :catalog_item, class_name: "Catalog::Item"
  delegate :category, to: :catalog_item
  delegate :name, to: :catalog_item
  delegate :description, to: :catalog_item
  belongs_to :session, class_name: "Shopping::Session", foreign_key: :shopping_session_id, optional: true

  scope :for_session, ->(session_id) { where(shopping_session_id: session_id) }
  scope :is_done, ->(done) {
    if done
      where.not(shopping_session_id: nil)
    else
      where(shopping_session_id: nil)
    end
  }

  def done?
    shopping_session_id.present?
  end
end
