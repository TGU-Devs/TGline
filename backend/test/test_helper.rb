ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "securerandom"

module TestDataHelper
  def create_test_user(attributes = {})
    defaults = {
      email: "user-#{SecureRandom.uuid}@example.com",
      password: "Password1",
      display_name: "Test User",
      role: "user",
      email_verified_at: Time.current
    }

    User.create!(defaults.merge(attributes))
  end

  def create_test_course(created_by:, attributes: {})
    defaults = {
      name: "Test Course #{SecureRandom.hex(4)}",
      category: "専門科目",
      faculty: "情報学部",
      department: "データサイエンス学科"
    }

    Course.create!(defaults.merge(attributes).merge(created_by: created_by))
  end

  def create_test_course_offering(course:, attributes: {})
    defaults = {
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
    }

    CourseOffering.create!(defaults.merge(attributes).merge(course: course))
  end

  def valid_course_review_attributes(course_offering:)
    {
      course_offering: course_offering,
      rating: 4,
      difficulty: 3,
      workload: 2,
      grading: 4,
      exam_presence: "yes",
      attendance_check: "sometimes",
      textbook_required: true,
      comment: "Useful review"
    }
  end
end

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    include TestDataHelper

    # Add more helper methods to be used by all tests here...
  end
end

class ActionDispatch::IntegrationTest
  include TestDataHelper

  private

  def sign_in_as(user, token: JwtService.encode(user.id))
    cookies[:jwt_token] = token
  end
end
