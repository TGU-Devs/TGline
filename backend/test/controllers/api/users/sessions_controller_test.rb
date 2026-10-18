# frozen_string_literal: true

require "test_helper"

module Api
  module Users
    class SessionsControllerTest < ActionDispatch::IntegrationTest
      test "sets authentication cookies and returns user when credentials are valid" do
        user = create_test_user

        assert_difference -> { AuthenticationSession.count }, 1 do
          post "/api/users/sign_in", params: {
            session: {
              email: user.email,
              password: "Password1"
            }
          }, as: :json
        end

        assert_response :ok

        body = JSON.parse(response.body)
        assert_equal "サインインに成功しました!", body["message"]
        assert_equal user.email, body.dig("user", "email")
        refute body.key?("token")
        assert cookies[:jwt_token].present?
        assert cookies[:refresh_token].present?
      end

      test "returns unauthorized when password is invalid" do
        user = create_test_user

        assert_no_difference -> { AuthenticationSession.count } do
          post "/api/users/sign_in", params: {
            session: {
              email: user.email,
              password: "WrongPass1"
            }
          }, as: :json
        end

        assert_response :unauthorized

        body = JSON.parse(response.body)
        assert_equal "メールアドレスまたはパスワードが正しくありません", body["error"]
      end

      test "returns forbidden when user email is not verified" do
        user = create_test_user(email_verified_at: nil)

        post "/api/users/sign_in", params: {
          session: {
            email: user.email,
            password: "Password1"
          }
        }, as: :json

        assert_response :forbidden

        body = JSON.parse(response.body)
        assert_equal true, body["requires_email_verification"]
      end

      test "returns forbidden for google provider account" do
        user = create_test_user(provider: "google", uid: "google-#{SecureRandom.uuid}")

        post "/api/users/sign_in", params: {
          session: {
            email: user.email,
            password: "Password1"
          }
        }, as: :json

        assert_response :forbidden

        body = JSON.parse(response.body)
        assert_equal "このメールアドレスはGoogleアカウントで登録されています。Googleログインを使用してください。", body["error"]
      end

      test "revokes current authentication session and clears cookies on sign out" do
        user = create_test_user
        post "/api/users/sign_in", params: {
          session: {
            email: user.email,
            password: "Password1"
          }
        }, as: :json
        authentication_session = user.authentication_sessions.find_by!

        delete "/api/users/sign_out"

        assert_response :no_content
        assert authentication_session.reload.revoked_at.present?
        assert cookies[:jwt_token].blank?
        assert cookies[:refresh_token].blank?
      end
    end
  end
end
