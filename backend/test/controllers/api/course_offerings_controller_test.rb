require "test_helper"

class Api::CourseOfferingsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @course = Course.create!(
      name: "データベース論",
      faculty: "情報学部",
      department: "データサイエンス学科",
      category: "専門科目",
      created_by: @user
    )
    CourseOffering.create!(
      course: @course,
      academic_year: 2026,
      semester: "first",
      teacher_name: "佐藤先生",
      day_of_week: "monday",
      period: 2,
      campus: "五橋キャンパス",
      classroom: "101"
    )
  end

  test "create requires login" do
    post "/api/courses/#{@course.id}/course_offerings", params: { course_offering: valid_params }

    assert_response :unauthorized
  end

  test "logged in user can add another offering to existing course" do
    sign_in(@user)

    assert_difference -> { @course.course_offerings.count }, 1 do
      post "/api/courses/#{@course.id}/course_offerings", params: { course_offering: valid_params }
    end

    assert_response :created
    body = JSON.parse(response.body)
    assert_equal 2027, body["academic_year"]
    assert_equal "田中先生", body["teacher_name"]
  end

  test "duplicate schedule returns unprocessable entity" do
    sign_in(@user)

    post "/api/courses/#{@course.id}/course_offerings", params: {
      course_offering: valid_params.merge(
        academic_year: 2026,
        semester: "first",
        teacher_name: "佐藤先生",
        day_of_week: "monday",
        period: 2
      )
    }

    assert_response :unprocessable_entity
  end

  private

  def sign_in(user)
    cookies[:jwt_token] = JwtService.encode(user.id)
  end

  def valid_params
    {
      academic_year: 2027,
      semester: "second",
      teacher_name: "田中先生",
      day_of_week: "tuesday",
      period: 3,
      campus: "五橋キャンパス",
      classroom: "302"
    }
  end
end
