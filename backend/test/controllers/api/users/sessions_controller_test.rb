# frozen_string_literal: true

require "test_helper"

module Api
  module Users
    class SessionsControllerTest < ActionDispatch::IntegrationTest
      test "returns token and user when credentials are valid" do
        user = users(:verified_user)

        post "/api/users/sign_in", params: {
          session: {
            email: user.email,
            password: "Password1"
          }
        }, as: :json

        assert_response :ok

        body = JSON.parse(response.body)
        assert_equal "サインインに成功しました!", body["message"]
        assert_equal user.email, body.dig("user", "email")
        assert body["token"].present?
      end

      test "returns unauthorized when password is invalid" do
        user = users(:verified_user)

        post "/api/users/sign_in", params: {
          session: {
            email: user.email,
            password: "WrongPass1"
          }
        }, as: :json

        assert_response :unauthorized

        body = JSON.parse(response.body)
        assert_equal "メールアドレスまたはパスワードが正しくありません", body["error"]
      end

      test "returns forbidden when user email is not verified" do
        user = users(:unverified_user)

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
        user = users(:google_user)

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
    end
  end
end
