class Post < ApplicationRecord
  belongs_to :user
  has_many :post_tags, dependent: :destroy
  has_many :tags, through: :post_tags
  has_many :likes, dependent: :destroy
  has_many :comments, dependent: :destroy

  validates :title, presence: true, length: { maximum: 100 }
  validates :body, presence: true, length: { maximum: 10000 }
  validate :at_most_one_faculty_tag

  private

  def at_most_one_faculty_tag
    faculty_tags = post_tags.map(&:tag).compact.select(&:faculty?)
    faculty_count = faculty_tags.size
    errors.add(:tags, "学部タグは最大1つまでです") if faculty_count > 1
  end

  public

  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }

  def soft_delete
    update(deleted_at: Time.current)
  end

  def deleted?
    deleted_at.present?
  end
end
