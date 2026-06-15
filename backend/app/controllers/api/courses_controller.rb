# frozen_string_literal: true

module Api
  class CoursesController < ApplicationController
    skip_before_action :authenticate_user!, only: [:index, :show]
    before_action :set_course, only: [:show, :update]

    def index
      per_page = 20
      page = [(params[:page] || 1).to_i, 1].max

      courses = filtered_courses.includes(:course_offerings).order(:name, :id)
      courses = courses.limit(per_page + 1).offset((page - 1) * per_page)
      has_next = courses.size > per_page
      courses = courses.first(per_page)
      aggregates = review_aggregates_for(courses.map(&:id))

      render json: {
        courses: courses.map { |course| course_response(course, aggregates[course.id]) },
        has_next: has_next
      }, status: :ok
    end

    def show
      aggregate = review_aggregates_for([@course.id])[@course.id]

      render json: course_response(@course, aggregate, include_offerings: true), status: :ok
    end

    def create
      course = nil

      Course.transaction do
        course = current_user.created_courses.build(course_params)
        course.save!

        course.course_offerings.create!(course_offering_params)
      end

      render json: course_response(course.reload, nil, include_offerings: true), status: :created
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors }, status: :unprocessable_entity
    end

    def update
      return unless authorize_course_manager!(@course)

      Course.transaction do
        @course.update!(course_params)

        if params[:course_offering].present?
          offering = @course.course_offerings.order(created_at: :asc).first || @course.course_offerings.build
          offering.update!(course_offering_params)
        end
      end

      render json: course_response(@course.reload, nil, include_offerings: true), status: :ok
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors }, status: :unprocessable_entity
    end

    private

    def set_course
      @course = Course.includes(:course_offerings).find_by(id: params[:id])
      return if @course

      render json: { errors: ["Course not found"] }, status: :not_found
    end

    def filtered_courses
      courses = Course.all
      courses = courses.where(faculty: params[:faculty]) if params[:faculty].present?
      courses = courses.where(department: params[:department]) if params[:department].present?
      courses = courses.where(category: params[:category]) if params[:category].present?
      courses = courses.left_joins(:course_offerings).where(course_offerings: { academic_year: params[:academic_year] }) if params[:academic_year].present?
      courses = courses.left_joins(:course_offerings).where(course_offerings: { semester: params[:semester] }) if params[:semester].present?
      courses = courses.left_joins(:course_offerings).where(course_offerings: { target_grade: params[:target_grade] }) if params[:target_grade].present?

      if params[:q].present?
        q = "%#{ActiveRecord::Base.sanitize_sql_like(params[:q].to_s.strip)}%"
        courses = courses.left_joins(:course_offerings).where(
          "courses.name ILIKE :q OR courses.faculty ILIKE :q OR courses.department ILIKE :q OR course_offerings.teacher_name ILIKE :q",
          q: q
        )
      end

      courses.distinct
    end

    def authorize_course_manager!(course)
      return true if current_user&.admin?
      return true if course.created_by_id == current_user&.id

      forbidden_error("この授業を編集する権限がありません")
      false
    end

    def course_params
      params.require(:course).permit(:name, :faculty, :department, :category)
    end

    def course_offering_params
      permitted = params.require(:course_offering).permit(
        :academic_year,
        :semester,
        :teacher_name,
        :day_of_week,
        :delivery_method,
        :target_grade,
        :period,
        :campus,
        :classroom
      )

      permitted[:semester] = "other" if permitted[:semester].blank?
      permitted[:delivery_method] = "in_person" if permitted[:delivery_method].blank?
      permitted[:target_grade] = "all_grades" if permitted[:target_grade].blank?
      permitted
    end

    def review_aggregates_for(course_ids)
      return {} if course_ids.empty?

      CourseReview.active
                  .where(course_id: course_ids)
                  .group(:course_id)
                  .pluck(
                    :course_id,
                    Arel.sql("COUNT(*)"),
                    Arel.sql("AVG(rating)"),
                    Arel.sql("AVG(difficulty)"),
                    Arel.sql("AVG(workload)"),
                    Arel.sql("AVG(attendance)"),
                    Arel.sql("AVG(grading)")
                  )
                  .to_h do |course_id, reviews_count, average_rating, average_difficulty, average_workload, average_attendance, average_grading|
        [
          course_id,
          {
            reviews_count: reviews_count.to_i,
            average_rating: rounded_average(average_rating),
            average_difficulty: rounded_average(average_difficulty),
            average_workload: rounded_average(average_workload),
            average_attendance: rounded_average(average_attendance),
            average_grading: rounded_average(average_grading)
          }
        ]
      end
    end

    def rounded_average(value)
      return nil if value.nil?

      value.to_d.round(1).to_f
    end

    def course_response(course, aggregate = nil, include_offerings: false)
      aggregate ||= {}

      response = {
        id: course.id,
        name: course.name,
        faculty: course.faculty,
        department: course.department,
        category: course.category,
        created_by_id: course.created_by_id,
        can_manage: admin? || course.created_by_id == current_user&.id,
        primary_course_offering: course_offering_response(course.course_offerings.first),
        reviews_count: aggregate.fetch(:reviews_count, 0),
        average_rating: aggregate[:average_rating],
        average_difficulty: aggregate[:average_difficulty],
        average_workload: aggregate[:average_workload],
        average_attendance: aggregate[:average_attendance],
        average_grading: aggregate[:average_grading],
        created_at: course.created_at.iso8601,
        updated_at: course.updated_at.iso8601
      }

      if include_offerings
        response[:course_offerings] = course.course_offerings.map { |offering| course_offering_response(offering) }
      end

      response
    end

    def course_offering_response(offering)
      return nil unless offering

      {
        id: offering.id,
        academic_year: offering.academic_year,
        semester: offering.semester,
        teacher_name: offering.teacher_name,
        day_of_week: offering.day_of_week,
        delivery_method: offering.delivery_method,
        target_grade: offering.target_grade,
        period: offering.period,
        campus: offering.campus,
        classroom: offering.classroom
      }
    end
  end
end
