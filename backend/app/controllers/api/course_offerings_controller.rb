# frozen_string_literal: true

module Api
  class CourseOfferingsController < ApplicationController
    before_action :set_course

    def create
      offering = @course.course_offerings.create!(course_offering_params)
      render json: course_offering_response(offering), status: :created
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors }, status: :unprocessable_entity
    end

    private

    def set_course
      @course = Course.find_by(id: params[:course_id])
      return if @course

      render json: { errors: ["Course not found"] }, status: :not_found
    end

    def course_offering_params
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
      if @course.category == "教養科目"
        permitted[:faculty] = nil
        permitted[:department] = nil
      end
      permitted
    end

    def course_offering_response(offering)
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
        classroom: offering.classroom,
        created_at: offering.created_at.iso8601,
        updated_at: offering.updated_at.iso8601
      }
    end
  end
end
