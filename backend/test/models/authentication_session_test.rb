# frozen_string_literal: true

require "test_helper"
require "digest"

class AuthenticationSessionTest < ActiveSupport::TestCase
  setup do
    @user = create_test_user
  end

  test "セッションを作成し生のリフレッシュトークンを返す" do
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

  test "同じセッションのリフレッシュトークンをローテーションし以前のトークンを無効にする" do
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

  test "期限切れの認証セッションではローテーションできない" do
    refresh_token = SecureRandom.urlsafe_base64(48)
    @user.authentication_sessions.create!(
      refresh_token_digest: Digest::SHA256.hexdigest(refresh_token),
      expires_at: 1.minute.ago
    )

    assert_raises(AuthenticationSession::InvalidRefreshToken) do
      AuthenticationSession.rotate!(refresh_token)
    end
  end

  test "失効済みの認証セッションではローテーションできない" do
    authentication_session, refresh_token = AuthenticationSession.start_for!(@user)
    authentication_session.revoke!

    assert_raises(AuthenticationSession::InvalidRefreshToken) do
      AuthenticationSession.rotate!(refresh_token)
    end
  end

  test "ユーザーの有効な認証セッションをすべて失効させる" do
    first_session, = AuthenticationSession.start_for!(@user)
    second_session, = AuthenticationSession.start_for!(@user)

    AuthenticationSession.revoke_all_for(@user)

    assert first_session.reload.revoked_at.present?
    assert second_session.reload.revoked_at.present?
  end
end
