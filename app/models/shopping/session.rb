class Shopping::Session < ApplicationRecord
  belongs_to :account

  before_create :set_default_name, if: -> { name.blank? }

  scope :active, -> { where(active: true) }

  private

  def set_default_name
    self.name = "Shopping Trip - #{Time.current.strftime('%b %d, %Y')}"
  end
end
