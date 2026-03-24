# frozen_string_literal: true

class PasswordResetMailer < ApplicationMailer
  layout false
  default from: ENV.fetch("MAILER_FROM_ADDRESS", "noreply@tgu-board.example.com")

  def reset_email(user, raw_token)
    @user = user
    @reset_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=#{raw_token}"
    @expires_in = "6時間"

    mail(to: @user.email, subject: "パスワードリセットのご案内")
  end

  def oauth_notification(user)
    @user = user
    @login_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3000')}/login"

    mail(to: @user.email, subject: "ログイン方法のご案内")
  end
end
