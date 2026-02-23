class Like < ApplicationRecord
  belongs_to :user
  belongs_to :post

  # ユニーク制約: 1人のユーザーが1つの投稿に対して1回しかいいねできない
  validates :user_id, uniqueness: { scope: :post_id }
end
