class Post < ApplicationRecord
  MAX_IMAGES = 4
  MAX_IMAGE_SIZE = 5.megabytes
  ACCEPTABLE_IMAGE_TYPES = %w[image/jpeg image/png image/webp image/gif].freeze

  belongs_to :user
  has_many_attached :images
  has_many :post_tags, dependent: :destroy
  has_many :tags, through: :post_tags
  has_many :likes, dependent: :destroy
  has_many :comments, dependent: :destroy

  validates :title, presence: true, length: { maximum: 100 }
  validates :body, presence: true, length: { maximum: 10000 }
  validate :acceptable_images
  validate :at_most_one_faculty_tag

  private

  def acceptable_images
    if images.attachments.size > MAX_IMAGES
      errors.add(:images, "は最大#{MAX_IMAGES}枚までです")
    end

    images.each do |image|
      unless ACCEPTABLE_IMAGE_TYPES.include?(image.content_type)
        errors.add(:images, "はJPEG、PNG、WebP、GIFのみアップロードできます")
      end

      if image.byte_size > MAX_IMAGE_SIZE
        errors.add(:images, "は1枚#{MAX_IMAGE_SIZE / 1.megabyte}MB以下にしてください")
      end
    end
  end

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
