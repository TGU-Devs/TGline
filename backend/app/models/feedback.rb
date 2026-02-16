class Feedback < ApplicationRecord
  belongs_to :user
  belongs_to :reviewer, class_name: "User", foreign_key: "reviewed_by", optional: true

  validates :category, presence: true, inclusion: { in: %w[bug feature_request question other] }
  validates :subject, presence: true, length: { maximum: 100 }
  validates :body, presence: true, length: { minimum: 10, maximum: 2000 }
  validates :status, presence: true, inclusion: { in: %w[pending reviewed resolved closed] }

  scope :active, -> { where(deleted_at: nil) }
  scope :pending, -> { where(status: "pending") }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_status, ->(status) { where(status: status) }

  def soft_delete
    update(deleted_at: Time.current)
  end

  def deleted?
    deleted_at.present?
  end
end
