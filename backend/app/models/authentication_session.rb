# frozen_string_literal: true

require "digest"
require "securerandom"

class AuthenticationSession < ApplicationRecord
  SESSION_LIFETIME = 30.days

  class InvalidRefreshToken < StandardError; end

  belongs_to :user

  validates :refresh_token_digest, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where(revoked_at: nil).where("expires_at > ?", Time.current) }

  def self.start_for!(user)
    raw_refresh_token = generate_refresh_token
    authentication_session = user.authentication_sessions.create!(
      refresh_token_digest: digest(raw_refresh_token),
      expires_at: SESSION_LIFETIME.from_now
    )

    [authentication_session, raw_refresh_token]
  end

  def self.rotate!(raw_refresh_token)
    raise InvalidRefreshToken if raw_refresh_token.blank?

    transaction do
      authentication_session = lock.find_by(refresh_token_digest: digest(raw_refresh_token))
      unless authentication_session&.active? && !authentication_session.user.deleted?
        raise InvalidRefreshToken
      end

      new_raw_refresh_token = generate_refresh_token
      authentication_session.update!(refresh_token_digest: digest(new_raw_refresh_token))

      [authentication_session, new_raw_refresh_token]
    end
  end

  def self.revoke_by_refresh_token(raw_refresh_token)
    return if raw_refresh_token.blank?

    find_by(refresh_token_digest: digest(raw_refresh_token))&.revoke!
  end

  def self.revoke_all_for(user)
    user.authentication_sessions.where(revoked_at: nil).update_all(
      revoked_at: Time.current,
      updated_at: Time.current
    )
  end

  def active?
    revoked_at.nil? && expires_at.future?
  end

  def revoke!
    update!(revoked_at: Time.current)
  end

  def self.generate_refresh_token
    SecureRandom.urlsafe_base64(48)
  end
  private_class_method :generate_refresh_token

  def self.digest(raw_refresh_token)
    Digest::SHA256.hexdigest(raw_refresh_token)
  end
  private_class_method :digest
end
