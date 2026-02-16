# frozen_string_literal: true

# Devise設定（APIモード用）
Devise.setup do |config|
  # ORM設定
  require 'devise/orm/active_record'

  # メール送信者設定
  config.mailer_sender = 'noreply@tgu-board.example.com'

  # パスワードの最小長
  config.password_length = 6..128

  # メールアドレスの正規表現
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/

  # セッションストレージ（APIモードでは不要）
  config.skip_session_storage = [:http_auth]

  # ストレッチ回数（テスト環境では1、それ以外は12）
  config.stretches = Rails.env.test? ? 1 : 12

  # パスワードリセット後の自動サインイン
  config.sign_in_after_reset_password = true

  # リセットパスワードトークンの有効期限
  config.reset_password_within = 6.hours

  # リメンバーミーの有効期限
  config.remember_for = 2.weeks

  # ログアウト時にすべてのリメンバーミートークンを無効化
  config.expire_all_remember_me_on_sign_out = true
end
