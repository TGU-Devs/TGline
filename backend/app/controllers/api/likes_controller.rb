# frozen_string_literal: true

module Api
  class LikesController < ApplicationController
    before_action :set_post

    # POST /api/posts/:post_id/likes
    def create
      like = current_user.likes.build(post: @post)

      Like.transaction do
        like.save!
        Notification.create_for_like!(like)
      end
      head :created
    rescue ActiveRecord::RecordInvalid
      head :unprocessable_entity
    end

    # DELETE /api/posts/:post_id/likes
    def destroy
      like = current_user.likes.find_by(post: @post)
      return head :not_found unless like

      Like.transaction do
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
