# frozen_string_literal: true

require "test_helper"

class CourseOfferingTest < ActiveSupport::TestCase
  setup do
    @user = create_test_user
    @course = create_test_course(created_by: @user)
  end

  test "rejects a duplicate schedule for the same course" do
    existing = create_test_course_offering(course: @course)
    duplicate = @course.course_offerings.build(existing.attributes.except("id", "created_at", "updated_at"))

    assert_not duplicate.valid?
    assert duplicate.errors[:course_id].present?
  end

  test "allows the same schedule for another course" do
    existing = create_test_course_offering(course: @course)
    other_course = create_test_course(created_by: @user)
    offering = other_course.course_offerings.build(existing.attributes.except("id", "course_id", "created_at", "updated_at"))

    assert offering.valid?
  end

  test "rejects an academic year before 2000 or a non-integer year" do
    assert_invalid_attribute(:academic_year, 1999)
    assert_invalid_attribute(:academic_year, 2026.5)
  end

  test "rejects a non-positive or non-integer period" do
    assert_invalid_attribute(:period, 0)
    assert_invalid_attribute(:period, 1.5)
  end

  test "requires semester delivery method target grade teacher and campus" do
    %i[semester delivery_method target_grade teacher_name campus].each do |attribute|
      assert_invalid_attribute(attribute, nil)
    end
  end

  test "requires faculty and department for a specialized course" do
    offering = build_offering(faculty: nil, department: nil)

    assert_not offering.valid?
    assert offering.errors[:faculty].present?
    assert offering.errors[:department].present?
  end

  private

  def build_offering(attributes = {})
    @course.course_offerings.build({
      academic_year: 2026,
      semester: "first",
      teacher_name: "Test Teacher",
      day_of_week: "monday",
      delivery_method: "in_person",
      target_grade: "all_grades",
      period: 1,
      campus: "五橋キャンパス",
      classroom: "101",
      faculty: "情報学部",
      department: "データサイエンス学科"
    }.merge(attributes))
  end

  def assert_invalid_attribute(attribute, value)
    offering = build_offering(attribute => value)

    assert_not offering.valid?, "expected #{attribute}=#{value.inspect} to be invalid"
    assert offering.errors[attribute].present?
  end
end
