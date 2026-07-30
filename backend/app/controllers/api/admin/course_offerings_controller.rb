# frozen_string_literal: true

module Api
  module Admin
    class CourseOfferingsController < ApplicationController
      before_action :authorize_admin!
      before_action :set_course_offering, only: [:update]

      def index
        offerings = CourseOffering.includes(:course).order(academic_year: :desc, semester: :asc, id: :asc)

        render json: {
          course_offerings: offerings.map { |offering| course_offering_response(offering) }
        }, status: :ok
      end

      def create
        offering = CourseOffering.create!(course_offering_params)
        render json: course_offering_response(offering), status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors }, status: :unprocessable_entity
      end

      def update
        @course_offering.update!(course_offering_params)
        render json: course_offering_response(@course_offering.reload), status: :ok
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors }, status: :unprocessable_entity
      end

      private

      def set_course_offering
        @course_offering = CourseOffering.includes(:course).find_by(id: params[:id])
        return if @course_offering

        render json: { errors: ["Course offering not found"] }, status: :not_found
      end

      def course_offering_params
        permitted = params.require(:course_offering).permit(
          :course_id,
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

        course = @course_offering&.course || Course.find_by(id: permitted[:course_id])
        if course&.category == "教養科目"
          permitted[:faculty] = nil
          permitted[:department] = nil
        end
        permitted
      end

      def course_offering_response(offering)
        {
          id: offering.id,
          course: {
            id: offering.course.id,
            name: offering.course.name
          },
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
end
