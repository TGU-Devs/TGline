class PostTag < ApplicationRecord
  belongs_to :post
  belongs_to :tag

  validates :tag_id, uniqueness: { scope: :post_id } # 同じ投稿に同じタグを2回付けられない
end
