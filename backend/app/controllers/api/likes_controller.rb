# frozen_string_literal: true

module Api
  class LikesController < ApplicationController
    before_action :set_post

    # POST /api/posts/:post_id/likes
    def create
      like = current_user.likes.build(post: @post)
      reached_email_threshold = false

      Like.transaction do
        @post.lock!
        like.save!
        Notification.create_for_like!(like)
        reached_email_threshold = @post.likes.count == LikeMilestoneEmailJob::THRESHOLD
      end

      LikeMilestoneEmailJob.perform_later(@post.id) if reached_email_threshold
      head :created
    rescue ActiveRecord::RecordInvalid
      head :unprocessable_entity
    end

    # DELETE /api/posts/:post_id/likes
    def destroy
      like = current_user.likes.find_by(post: @post)
      return head :not_found unless like

      Like.transaction do
        @post.lock!
        Notification.destroy_for_like_or_comment!(like)
        like.destroy!
      end
      head :no_content
    end

    private

    def set_post
      @post = Post.active.find_by(id: params[:post_id])
      return if @post

      render json: { errors: ['Post not found'] }, status: :not_found
    end
  end
end
