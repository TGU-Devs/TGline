# frozen_string_literal: true

require "test_helper"

class Api::CourseReviewsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = create_test_user(display_name: "Review Owner")
    @other_user = create_test_user(display_name: "Other User")
    @admin = create_test_user(display_name: "Admin User", role: "admin")
    @course = create_test_course(created_by: @owner)
    @course_offering = create_test_course_offering(course: @course)
    @review = create_review(user: @owner)
  end

  test "create requires authentication" do
    assert_no_difference -> { CourseReview.count } do
      post "/api/courses/#{@course.id}/reviews", params: {
        course_review: valid_review_params
      }, as: :json
    end

    assert_response :unauthorized
  end

  test "authenticated user can create a review" do
    sign_in_as(@other_user)

    assert_difference -> { CourseReview.count }, 1 do
      post "/api/courses/#{@course.id}/reviews", params: {
        course_review: valid_review_params
      }, as: :json
    end

    assert_response :created
    body = JSON.parse(response.body)
    assert_equal @course.id, body["course_id"]
    assert_equal @course_offering.id, body["course_offering_id"]
    assert_equal @other_user.id, CourseReview.last.user_id
  end

  test "create rejects a score outside one through five" do
    sign_in_as(@other_user)

    assert_no_difference -> { CourseReview.count } do
      post "/api/courses/#{@course.id}/reviews", params: {
        course_review: valid_review_params.merge(rating: 6)
      }, as: :json
    end

    assert_response :unprocessable_entity
  end

  test "create rejects an offering from another course" do
    other_course = create_test_course(created_by: @owner)
    other_offering = create_test_course_offering(course: other_course)
    sign_in_as(@other_user)

    assert_no_difference -> { CourseReview.count } do
      post "/api/courses/#{@course.id}/reviews", params: {
        course_review: valid_review_params.merge(course_offering_id: other_offering.id)
      }, as: :json
    end

    assert_response :unprocessable_entity
  end

  test "owner can update a review" do
    sign_in_as(@owner)

    patch "/api/course_reviews/#{@review.id}", params: {
      course_review: valid_review_params.merge(comment: "Updated review")
    }, as: :json

    assert_response :ok
    assert_equal "Updated review", @review.reload.comment
  end

  test "update requires authentication" do
    patch "/api/course_reviews/#{@review.id}", params: {
      course_review: valid_review_params.merge(comment: "Unauthenticated change")
    }, as: :json

    assert_response :unauthorized
    assert_equal "Original review", @review.reload.comment
  end

  test "another user cannot update a review" do
    sign_in_as(@other_user)

    patch "/api/course_reviews/#{@review.id}", params: {
      course_review: valid_review_params.merge(comment: "Unauthorized change")
    }, as: :json

    assert_response :forbidden
    assert_equal "Original review", @review.reload.comment
  end

  test "owner can soft delete a review" do
    sign_in_as(@owner)

    assert_no_difference -> { CourseReview.count } do
      delete "/api/course_reviews/#{@review.id}"
    end

    assert_response :no_content
    assert @review.reload.deleted?
  end

  test "destroy requires authentication" do
    delete "/api/course_reviews/#{@review.id}"

    assert_response :unauthorized
    assert_not @review.reload.deleted?
  end

  test "another user cannot delete a review" do
    sign_in_as(@other_user)

    delete "/api/course_reviews/#{@review.id}"

    assert_response :forbidden
    assert_not @review.reload.deleted?
  end

  test "admin can soft delete another users review" do
    sign_in_as(@admin)

    delete "/api/course_reviews/#{@review.id}"

    assert_response :no_content
    assert @review.reload.deleted?
  end

  test "soft deleted review is excluded from index" do
    @review.soft_delete

    get "/api/courses/#{@course.id}/reviews"

    assert_response :ok
    review_ids = JSON.parse(response.body).fetch("course_reviews").pluck("id")
    assert_not_includes review_ids, @review.id
  end

  private

  def create_review(user:)
    CourseReview.create!(
      valid_course_review_attributes(course_offering: @course_offering)
        .merge(course: @course, user: user, comment: "Original review")
    )
  end

  def valid_review_params
    {
      course_offering_id: @course_offering.id,
      rating: 4,
      difficulty: 3,
      workload: 2,
      grading: 4,
      exam_presence: "yes",
      attendance_check: "sometimes",
      textbook_required: true,
      comment: "Created review"
    }
  end
end
