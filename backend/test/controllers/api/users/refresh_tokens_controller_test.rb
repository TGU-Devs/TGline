# frozen_string_literal: true

require "test_helper"
require "digest"

module Api
  module Users
    class RefreshTokensControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = create_test_user
        post "/api/users/sign_in", params: {
          session: {
            email: @user.email,
            password: "Password1"
          }
        }, as: :json
        @authentication_session = @user.authentication_sessions.sole
        @refresh_token = cookies[:refresh_token]
      end

      test "リフレッシュトークンをローテーションして新しいアクセストークンを発行する" do
        previous_digest = @authentication_session.refresh_token_digest

        assert_no_difference -> { AuthenticationSession.count } do
          post "/api/users/refresh"
        end

        assert_response :no_content
        assert cookies[:jwt_token].present?
        assert cookies[:refresh_token].present?
        refute_equal @refresh_token, cookies[:refresh_token]
        refute_equal previous_digest, @authentication_session.reload.refresh_token_digest

        payload = JwtService.decode(cookies[:jwt_token])
        assert_equal @user.id, payload["user_id"]
      end

      test "リフレッシュトークンがなければ認証を拒否する" do
        cookies.delete("refresh_token")

        post "/api/users/refresh"

        assert_response :unauthorized
        assert_equal "invalid_refresh_token", JSON.parse(response.body)["error"]
      end

      test "リフレッシュトークンが不正なら認証を拒否してCookieを削除する" do
        @authentication_session.update!(
          refresh_token_digest: Digest::SHA256.hexdigest(SecureRandom.urlsafe_base64(48))
        )

        post "/api/users/refresh"

        assert_response :unauthorized
        assert_equal "invalid_refresh_token", JSON.parse(response.body)["error"]
        assert cookies[:jwt_token].blank?
        assert cookies[:refresh_token].blank?
      end

      test "認証セッションが期限切れなら認証を拒否する" do
        @authentication_session.update!(expires_at: 1.minute.ago)

        post "/api/users/refresh"

        assert_response :unauthorized
        assert_equal "invalid_refresh_token", JSON.parse(response.body)["error"]
      end
    end
  end
end
