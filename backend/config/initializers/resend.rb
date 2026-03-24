# frozen_string_literal: true

Resend.api_key = ENV.fetch("RESEND_API_KEY") { Rails.env.production? ? raise("RESEND_API_KEY is required in production") : nil }

# ActionMailerのdelivery methodとしてResendを使用
Rails.application.config.action_mailer.delivery_method = :resend
