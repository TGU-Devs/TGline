# frozen_string_literal: true

require "test_helper"

class Api::AuthenticationAuthorizationTest < ActionDispatch::IntegrationTest
  test "protected endpoint rejects an unauthenticated request" do
    get "/api/users/me"

    assert_response :unauthorized
    assert_equal "unauthorized", JSON.parse(response.body)["error"]
  end

  test "protected endpoint rejects an invalid JWT" do
    cookies[:jwt_token] = "invalid.jwt.token"

    get "/api/users/me"

    assert_response :unauthorized
    assert_equal "unauthorized", JSON.parse(response.body)["error"]
  end

  test "protected endpoint reports an expired JWT" do
    user = create_test_user
    expired_token = JWT.encode(
      { user_id: user.id, exp: 1.minute.ago.to_i },
      JwtService::SECRET_KEY,
      "HS256"
    )
    sign_in_as(user, token: expired_token)

    get "/api/users/me"

    assert_response :unauthorized
    assert_equal "token_expired", JSON.parse(response.body)["error"]
  end

  test "protected endpoint rejects a soft deleted user" do
    user = create_test_user
    token = JwtService.encode(user.id)
    user.soft_delete
    sign_in_as(user, token: token)

    get "/api/users/me"

    assert_response :unauthorized
    assert_equal "unauthorized", JSON.parse(response.body)["error"]
  end

  test "regular user cannot access an admin endpoint" do
    user = create_test_user
    sign_in_as(user)

    get "/api/admin/stats"

    assert_response :forbidden
  end

  test "admin can access an admin endpoint" do
    admin = create_test_user(role: "admin")
    sign_in_as(admin)

    get "/api/admin/stats"

    assert_response :ok
    assert JSON.parse(response.body).key?("counts")
  end
end
