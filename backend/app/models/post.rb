class Post < ApplicationRecord
  belongs_to :user

  validates :title, presence: true
  validates :body, presence: true

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
