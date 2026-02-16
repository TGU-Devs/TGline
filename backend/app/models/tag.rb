class Tag < ApplicationRecord
  enum :category, { faculty: 0, topic: 1 }

  DEFINITIONS = {
    faculty: %w[文学部 経済学部 経営学部 法学部 工学部 情報学部 心理学部 国際学部 地域総合学部],
    topic: %w[就活 サークル 履修相談 アルバイト 大学生活 その他]
  }.freeze # タグの定義を定数で管理

  has_many :post_tags, dependent: :destroy # 中間テーブルへの直接アクセス
  has_many :posts, through: :post_tags # 投稿への間接アクセス

  validates :category, presence: true # カテゴリは必須
end
