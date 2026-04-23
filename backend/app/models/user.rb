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

  # パスワード強度バリデーション
  validate :password_complexity, if: :password_required?

  # バリデーション
  validates :display_name, presence: true, length: { maximum: 20 }
  validates :role, presence: true, inclusion: { in: %w[user admin] }
  validates :description, length: { maximum: 200 }, allow_nil: true
  validate :oauth_user_cannot_change_email, on: :update

  # スコープ
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }


  def soft_delete
    update(deleted_at: Time.current)
  end

  def deleted?
    deleted_at.present?
  end

  def admin?
    role == 'admin'
  end

  def email_verified?
    email_verified_at.present?
  end

  def generate_email_verification_token!
    raw_token, encrypted_token = Devise.token_generator.generate(User, :email_verification_token)
    update!(
      email_verification_token: encrypted_token,
      email_verification_sent_at: Time.current
    )
    raw_token
  end

  private

  def password_complexity
    return if password.blank?

    errors.add(:password, "は8文字以上で入力してください") if password.length < 8
    errors.add(:password, "には大文字を含めてください") unless password.match?(/[A-Z]/)
    errors.add(:password, "には小文字を含めてください") unless password.match?(/[a-z]/)
    errors.add(:password, "には数字を含めてください") unless password.match?(/[0-9]/)
  end

  def oauth_user_cannot_change_email
    return unless provider.present?
    return unless will_save_change_to_email?

    errors.add(:email, "OAuthユーザーは変更できません")
  end
end
