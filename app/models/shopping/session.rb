class Shopping::Session < ApplicationRecord
  belongs_to :account
  has_many :items, class_name: "Shopping::Item", foreign_key: :shopping_session_id, dependent: :nullify

  before_create :set_default_name, if: -> { name.blank? }

  scope :active, -> { where(active: true) }

  private

  def set_default_name
    self.name = "Shopping Trip - #{Time.current.strftime('%b %d, %Y')}"
  end
end
