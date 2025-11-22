module Catalog
  class Item < ApplicationRecord
    belongs_to :account
    belongs_to :category, class_name: "Catalog::Category", foreign_key: :category_id, optional: true

    validates :name, presence: true

    # Soft delete scopes
    scope :active, -> { where(deleted_at: nil) }
    scope :deleted, -> { where.not(deleted_at: nil) }

    # Default scope to exclude deleted items
    default_scope { active }

    # Soft delete method
    def soft_delete
      update(deleted_at: Time.current)
    end

    # Check if item is deleted
    def deleted?
      deleted_at.present?
    end
  end
end
