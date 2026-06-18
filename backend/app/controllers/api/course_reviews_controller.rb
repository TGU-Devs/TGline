# frozen_string_literal: true

module Api
  class CourseReviewsController < ApplicationController
    skip_before_action :authenticate_user!, only: [:index]
    before_action :set_course, only: [:index, :create]
    before_action :set_course_review, only: [:update, :destroy]

    def index
      reviews = @course.course_reviews.active.includes(:user, :course_offering).order(created_at: :desc)

      render json: {
        course_reviews: reviews.map { |review| course_review_response(review) }
      }, status: :ok
    end

    def create
      review = @course.course_reviews.build(course_review_params)
      review.user = current_user

      if review.save
        render json: course_review_response(review), status: :created
      else
        render json: { errors: review.errors }, status: :unprocessable_entity
      end
    end

    def update
      authorize_owner!(@course_review)

      if @course_review.update(course_review_params)
        render json: course_review_response(@course_review.reload), status: :ok
      else
        render json: { errors: @course_review.errors }, status: :unprocessable_entity
      end
    end

    def destroy
      authorize_owner_or_admin!(@course_review)
      return if performed?

      @course_review.soft_delete
      head :no_content
    end

    private

    def set_course
      @course = Course.find_by(id: params[:course_id])
      return if @course

      render json: { errors: ["Course not found"] }, status: :not_found
    end

    def set_course_review
      @course_review = CourseReview.active.includes(:user, :course, :course_offering).find_by(id: params[:id])
      return if @course_review

      render json: { errors: ["Course review not found"] }, status: :not_found
    end

    def course_review_params
      params.require(:course_review).permit(
        :course_offering_id,
        :rating,
        :difficulty,
        :workload,
        :grading,
        :exam_presence,
        :attendance_check,
        :textbook_required,
        :comment
      )
    end

    def course_review_response(review)
      {
        id: review.id,
        course_id: review.course_id,
        course_offering_id: review.course_offering_id,
        user: {
          id: review.user.id,
          display_name: review.user.display_name
        },
        rating: review.rating,
        difficulty: review.difficulty,
        workload: review.workload,
        grading: review.grading,
        exam_presence: review.exam_presence,
        attendance_check: review.attendance_check,
        textbook_required: review.textbook_required,
        comment: review.comment,
        created_at: review.created_at.iso8601,
        updated_at: review.updated_at.iso8601
      }
    end
  end
end
