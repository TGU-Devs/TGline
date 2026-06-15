# frozen_string_literal: true

module Api
  module Admin
    class CoursesController < ApplicationController
      before_action :authorize_admin!
      before_action :set_course, only: [:update]

      def index
        courses = Course.order(:name, :id)

        render json: {
          courses: courses.map { |course| course_response(course) }
        }, status: :ok
      end

      def create
        course = Course.new(course_params)

        if course.save
          render json: course_response(course), status: :created
        else
          render json: { errors: course.errors }, status: :unprocessable_entity
        end
      end

      def update
        if @course.update(course_params)
          render json: course_response(@course), status: :ok
        else
          render json: { errors: @course.errors }, status: :unprocessable_entity
        end
      end

      private

      def set_course
        @course = Course.find_by(id: params[:id])
        return if @course

        render json: { errors: ["Course not found"] }, status: :not_found
      end

      def course_params
        params.require(:course).permit(:name, :faculty, :department, :category)
      end

      def course_response(course)
        {
          id: course.id,
          name: course.name,
          faculty: course.faculty,
          department: course.department,
          category: course.category,
          created_at: course.created_at.iso8601,
          updated_at: course.updated_at.iso8601
        }
      end
    end
  end
end
