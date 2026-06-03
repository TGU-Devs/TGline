# frozen_string_literal: true

class EmailVerificationMailer < ApplicationMailer
  layout false
  default from: ENV.fetch("MAILER_FROM_ADDRESS", "noreply@tgline.example.com")

  def verification_email(user, raw_token)
    @user = user
    @verify_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=#{raw_token}"
    @expires_in = "24時間"

    mail(to: @user.email, subject: "メールアドレス認証のお願い")
  end
end
