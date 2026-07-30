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
      primary_offering_ids = primary_offering_ids_for(courses.map(&:id))

      render json: {
        courses: courses.map do |course|
          course_response(
            course,
            aggregates[course.id],
            primary_offering_id: primary_offering_ids[course.id]
          )
        end,
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
        course = Course.find_or_initialize_by(
          name: course_params[:name].to_s.strip,
          category: course_params[:category]
        )
        if course.new_record?
          course.created_by = current_user
          course.assign_attributes(legacy_course_target_attributes)
          course.save!
        end

        course.course_offerings.create!(course_offering_params(course))
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
          offering.update!(course_offering_params(@course))
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
      courses = courses.where(category: params[:category]) if params[:category].present?

      if offering_filter_present?
        courses = courses.joins(:course_offerings)
                         .where(course_offerings: { id: filtered_course_offerings.select(:id) })
      end

      if params[:q].present?
        q = "%#{ActiveRecord::Base.sanitize_sql_like(params[:q].to_s.strip)}%"
        courses = courses.left_joins(:course_offerings).where(
          "courses.name ILIKE :q OR course_offerings.teacher_name ILIKE :q OR course_offerings.faculty ILIKE :q OR course_offerings.department ILIKE :q",
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
      params.require(:course).permit(:name, :category)
    end

    def course_offering_params(course)
      permitted = params.require(:course_offering).permit(
        :academic_year,
        :semester,
        :teacher_name,
        :day_of_week,
        :delivery_method,
        :target_grade,
        :faculty,
        :department,
        :period,
        :campus,
        :classroom
      )

      permitted[:semester] = "other" if permitted[:semester].blank?
      permitted[:delivery_method] = "in_person" if permitted[:delivery_method].blank?
      permitted[:target_grade] = "all_grades" if permitted[:target_grade].blank?
      if course.category == "教養科目"
        permitted[:faculty] = nil
        permitted[:department] = nil
      end
      permitted
    end

    def legacy_course_target_attributes
      return { faculty: nil, department: nil } if course_params[:category] == "教養科目"

      {
        faculty: params.dig(:course_offering, :faculty),
        department: params.dig(:course_offering, :department)
      }
    end

    def filtered_course_offerings
      offerings = CourseOffering.joins(:course)
      offerings = offerings.where(academic_year: params[:academic_year]) if params[:academic_year].present?
      offerings = offerings.where(semester: params[:semester]) if params[:semester].present?
      offerings = filter_offerings_by_target(offerings)
      offerings = filter_offerings_by_grade(offerings)
      offerings
    end

    def filter_offerings_by_target(offerings)
      return offerings unless params[:faculty].present? || params[:department].present?

      matching = offerings
      matching = matching.where(faculty: params[:faculty]) if params[:faculty].present?
      matching = matching.where(department: params[:department]) if params[:department].present?

      offerings.where(courses: { category: "教養科目" }).or(matching)
    end

    def filter_offerings_by_grade(offerings)
      return offerings unless params[:target_grade].present?

      offerings.where(target_grade: ["all_grades", params[:target_grade]])
    end

    def offering_filter_present?
      %i[academic_year semester faculty department target_grade].any? { |key| params[key].present? }
    end

    def primary_offering_ids_for(course_ids)
      return {} unless offering_filter_present?

      filtered_course_offerings
        .where(course_id: course_ids)
        .order(academic_year: :desc, semester: :asc, id: :asc)
        .pluck(:course_id, :id)
        .each_with_object({}) do |(course_id, offering_id), result|
          result[course_id] ||= offering_id
        end
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
                    Arel.sql("AVG(grading)")
                  )
                  .to_h do |course_id, reviews_count, average_rating, average_difficulty, average_workload, average_grading|
        [
          course_id,
          {
            reviews_count: reviews_count.to_i,
            average_rating: rounded_average(average_rating),
            average_difficulty: rounded_average(average_difficulty),
            average_workload: rounded_average(average_workload),
            average_grading: rounded_average(average_grading)
          }
        ]
      end
    end

    def rounded_average(value)
      return nil if value.nil?

      value.to_d.round(1).to_f
    end

    def course_response(course, aggregate = nil, include_offerings: false, primary_offering_id: nil)
      aggregate ||= {}
      primary_offering = if primary_offering_id
                           course.course_offerings.find { |offering| offering.id == primary_offering_id }
                         else
                           course.course_offerings.first
                         end

      response = {
        id: course.id,
        name: course.name,
        category: course.category,
        created_by_id: course.created_by_id,
        can_manage: admin? || course.created_by_id == current_user&.id,
        primary_course_offering: course_offering_response(primary_offering),
        reviews_count: aggregate.fetch(:reviews_count, 0),
        average_rating: aggregate[:average_rating],
        average_difficulty: aggregate[:average_difficulty],
        average_workload: aggregate[:average_workload],
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
        faculty: offering.faculty,
        department: offering.department,
        period: offering.period,
        campus: offering.campus,
        classroom: offering.classroom
      }
    end
  end
end
