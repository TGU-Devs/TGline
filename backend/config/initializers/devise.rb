# frozen_string_literal: true

Devise.setup do |config|
  require 'devise/orm/active_record'

  config.mailer_sender = 'noreply@tgu-board.example.com'
  config.password_length = 6..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/
  config.skip_session_storage = [:http_auth]
  config.stretches = Rails.env.test? ? 1 : 12
  config.sign_in_after_reset_password = true
  config.reset_password_within = 6.hours
  config.remember_for = 2.weeks
  config.expire_all_remember_me_on_sign_out = true
end
