class Post < ApplicationRecord
  belongs_to :user
  has_many :post_tags, dependent: :destroy # 中間テーブルへの直接アクセス
  has_many :tags, through: :post_tags # タグへの間接アクセス
  has_many :likes, dependent: :destroy
  has_many :comments, dependent: :destroy

  validates :title, presence: true
  validates :body, presence: true
  validate :at_most_one_faculty_tag  # カスタムバリデーション：学部タグは最大1つ

  private

  def at_most_one_faculty_tag
    faculty_tags = post_tags.map(&:tag).compact.select(&:faculty?)
    faculty_count = faculty_tags.size
    if faculty_count > 1
      errors.add(:tags, "学部タグは最大1つまでです")
    end
  end

  public

  # スコープ(クエリのショートカット)。集合検索でSQLを発行する
  # 投稿がactive(公開)かdeleted(削除)かを判断するメソッド的なもの。
  # 使い方としてはPost.activeで公開中の投稿を取得できる。
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }

  # 論理削除(deleted_atカラムに現在時刻を保存することで論理削除を行う)
  def soft_delete
    update(deleted_at: Time.current)
  end

  # 投稿がdeletedかどうかを判断するメソッド1人の Post インスタンスに対する質問
  def deleted?
    deleted_at.present?
  end
end
