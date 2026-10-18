# frozen_string_literal: true

require "test_helper"

module Api
  module Users
    class PasswordsControllerTest < ActionDispatch::IntegrationTest
      test "changes password and revokes all authentication sessions" do
        user = create_test_user
        post "/api/users/sign_in", params: {
          session: {
            email: user.email,
            password: "Password1"
          }
        }, as: :json
        current_session = user.authentication_sessions.find_by!
        other_session, = AuthenticationSession.start_for!(user)

        patch "/api/users/password", params: {
          password: {
            current_password: "Password1",
            new_password: "NewPassword2"
          }
        }, as: :json

        assert_response :ok
        assert user.reload.valid_password?("NewPassword2")
        assert current_session.reload.revoked_at.present?
        assert other_session.reload.revoked_at.present?
        assert cookies[:jwt_token].blank?
        assert cookies[:refresh_token].blank?
      end
    end
  end
end
