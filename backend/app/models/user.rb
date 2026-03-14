# frozen_string_literal: true

class User < ApplicationRecord
  # Devise設定
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :posts, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :comments, dependent: :destroy

  # OAuthユーザーはパスワード不要
  def password_required?
    provider.blank? && super
  end

  # バリデーション
  validates :display_name, presence: true, length: { maximum: 20 }
  validates :role, presence: true, inclusion: { in: %w[user admin] }
  validates :description, length: { maximum: 200 }, allow_nil: true # roleの値はuserかadminのみ

  # スコープ(クエリのショートカット)。集合検索でSQLを発行する
  # ユーザーがactiveかdeletedかを判断するメソッド的なもの。
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }

  # 論理削除(deleted_atカラムに現在時刻を保存することで論理削除を行う)
  def soft_delete
    update(deleted_at: Time.current)
  end

  # ユーザーがdeletedかどうかを判断するメソッド1人の User インスタンスに対する質問
  def deleted?
    deleted_at.present?
  end

  # 管理者チェック
  def admin?
    role == 'admin'
  end
end
