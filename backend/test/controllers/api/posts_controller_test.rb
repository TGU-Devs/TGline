# frozen_string_literal: true

require "test_helper"

class Api::PostsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = create_test_user(display_name: "Post Owner")
    @other_user = create_test_user(display_name: "Other User")
    @admin = create_test_user(display_name: "Admin User", role: "admin")
    @post = Post.create!(user: @owner, title: "Original title", body: "Original body")
  end

  test "create requires authentication" do
    assert_no_difference -> { Post.count } do
      post "/api/posts", params: { post: valid_post_params }, as: :json
    end

    assert_response :unauthorized
  end

  test "authenticated user can create a post" do
    sign_in_as(@owner)

    assert_difference -> { Post.count }, 1 do
      post "/api/posts", params: { post: valid_post_params }, as: :json
    end

    assert_response :created
    body = JSON.parse(response.body)
    assert_equal "Created title", body["title"]
    assert_equal @owner.id, Post.last.user_id
  end

  test "owner can update a post" do
    sign_in_as(@owner)

    patch "/api/posts/#{@post.id}", params: {
      post: { title: "Updated title", body: "Updated body" }
    }, as: :json

    assert_response :ok
    assert_equal "Updated title", @post.reload.title
  end

  test "update requires authentication" do
    patch "/api/posts/#{@post.id}", params: {
      post: { title: "Unauthenticated change", body: "Unauthenticated body" }
    }, as: :json

    assert_response :unauthorized
    assert_equal "Original title", @post.reload.title
  end

  test "another user cannot update a post" do
    sign_in_as(@other_user)

    patch "/api/posts/#{@post.id}", params: {
      post: { title: "Unauthorized change", body: "Unauthorized body" }
    }, as: :json

    assert_response :forbidden
    assert_equal "Original title", @post.reload.title
  end

  test "owner can soft delete a post" do
    sign_in_as(@owner)

    assert_no_difference -> { Post.count } do
      delete "/api/posts/#{@post.id}"
    end

    assert_response :no_content
    assert @post.reload.deleted?
  end

  test "destroy requires authentication" do
    delete "/api/posts/#{@post.id}"

    assert_response :unauthorized
    assert_not @post.reload.deleted?
  end

  test "another user cannot delete a post" do
    sign_in_as(@other_user)

    delete "/api/posts/#{@post.id}"

    assert_response :forbidden
    assert_not @post.reload.deleted?
  end

  test "admin can soft delete another users post" do
    sign_in_as(@admin)

    delete "/api/posts/#{@post.id}"

    assert_response :no_content
    assert @post.reload.deleted?
  end

  test "soft deleted post is excluded from show and index" do
    @post.soft_delete
    sign_in_as(@owner)

    get "/api/posts/#{@post.id}"
    assert_response :not_found

    get "/api/posts"
    assert_response :ok
    post_ids = JSON.parse(response.body).fetch("posts").pluck("id")
    assert_not_includes post_ids, @post.id
  end

  private

  def valid_post_params
    { title: "Created title", body: "Created body" }
  end
end
