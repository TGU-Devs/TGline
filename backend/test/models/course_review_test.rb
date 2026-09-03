# frozen_string_literal: true

require "test_helper"

class CourseReviewTest < ActiveSupport::TestCase
  setup do
    @user = create_test_user
    @course = create_test_course(created_by: @user)
    @course_offering = create_test_course_offering(course: @course)
  end

  test "accepts score values from one through five" do
    review = build_review

    %i[rating difficulty workload grading].each do |attribute|
      review.public_send("#{attribute}=", 1)
      assert review.valid?, "expected #{attribute}=1 to be valid"

      review.public_send("#{attribute}=", 5)
      assert review.valid?, "expected #{attribute}=5 to be valid"
    end
  end

  test "rejects score values outside one through five" do
    %i[rating difficulty workload grading].each do |attribute|
      [0, 6].each do |value|
        review = build_review(attribute => value)

        assert_not review.valid?, "expected #{attribute}=#{value} to be invalid"
        assert review.errors[attribute].present?
      end
    end
  end

  test "rejects an offering that belongs to another course" do
    other_course = create_test_course(created_by: @user)
    other_offering = create_test_course_offering(course: other_course)
    review = build_review(course_offering: other_offering)

    assert_not review.valid?
    assert_includes review.errors[:course_offering], "must belong to the selected course"
  end

  test "allows multiple active reviews by the same user for the same offering" do
    first_review = build_review
    second_review = build_review(comment: "Second review")

    assert first_review.save
    assert second_review.save
  end

  test "soft delete marks the review and updates active and deleted scopes" do
    review = build_review
    review.save!

    assert_includes CourseReview.active, review
    assert_not review.deleted?

    assert review.soft_delete
    assert review.deleted?
    assert_not_includes CourseReview.active, review
    assert_includes CourseReview.deleted, review
  end

  private

  def build_review(attributes = {})
    CourseReview.new(
      valid_course_review_attributes(course_offering: @course_offering)
        .merge(course: @course, user: @user)
        .merge(attributes)
    )
  end
end
