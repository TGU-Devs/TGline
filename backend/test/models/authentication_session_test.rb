# frozen_string_literal: true

require "test_helper"
require "digest"

class AuthenticationSessionTest < ActiveSupport::TestCase
  setup do
    @user = create_test_user
  end

  test "start_for creates a session and returns a raw refresh token" do
    authentication_session = nil
    refresh_token = nil

    assert_difference -> { AuthenticationSession.count }, 1 do
      authentication_session, refresh_token = AuthenticationSession.start_for!(@user)
    end

    assert authentication_session.active?
    assert_equal Digest::SHA256.hexdigest(refresh_token), authentication_session.refresh_token_digest
    refute_equal refresh_token, authentication_session.refresh_token_digest
    assert_in_delta 30.days.from_now.to_f, authentication_session.expires_at.to_f, 2
  end

  test "rotate updates the same session and invalidates the previous refresh token" do
    authentication_session, refresh_token = AuthenticationSession.start_for!(@user)
    rotated_session = nil
    new_refresh_token = nil

    assert_no_difference -> { AuthenticationSession.count } do
      rotated_session, new_refresh_token = AuthenticationSession.rotate!(refresh_token)
    end

    assert_equal authentication_session.id, rotated_session.id
    refute_equal refresh_token, new_refresh_token
    assert_equal Digest::SHA256.hexdigest(new_refresh_token), authentication_session.reload.refresh_token_digest
    assert_raises(AuthenticationSession::InvalidRefreshToken) do
      AuthenticationSession.rotate!(refresh_token)
    end
  end

  test "rotate rejects an expired session" do
    refresh_token = SecureRandom.urlsafe_base64(48)
    @user.authentication_sessions.create!(
      refresh_token_digest: Digest::SHA256.hexdigest(refresh_token),
      expires_at: 1.minute.ago
    )

    assert_raises(AuthenticationSession::InvalidRefreshToken) do
      AuthenticationSession.rotate!(refresh_token)
    end
  end

  test "rotate rejects a revoked session" do
    authentication_session, refresh_token = AuthenticationSession.start_for!(@user)
    authentication_session.revoke!

    assert_raises(AuthenticationSession::InvalidRefreshToken) do
      AuthenticationSession.rotate!(refresh_token)
    end
  end

  test "revoke_all_for revokes all active sessions for the user" do
    first_session, = AuthenticationSession.start_for!(@user)
    second_session, = AuthenticationSession.start_for!(@user)

    AuthenticationSession.revoke_all_for(@user)

    assert first_session.reload.revoked_at.present?
    assert second_session.reload.revoked_at.present?
  end
end
