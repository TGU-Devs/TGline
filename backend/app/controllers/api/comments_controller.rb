# frozen_string_literal: true

module Api
  class CommentsController < ApplicationController
    before_action :set_post

    # GET /api/posts/:post_id/comments
    def index
      comments = @post.comments.active.includes(user: { avatar_attachment: :blob }).order(created_at: :asc)

      render json: comments.map { |comment| comment_response(comment) }, status: :ok
    end

    # POST /api/posts/:post_id/comments
    def create
      comment = current_user.comments.build(comment_params.merge(post: @post))

      Comment.transaction do
        comment.save!
        Notification.create_for_comment!(comment)
      end
      render json: comment_response(comment), status: :created
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors }, status: :unprocessable_entity
    end

    # DELETE /api/posts/:post_id/comments/:id
    def destroy
      comment = @post.comments.active.find_by(id: params[:id])
      return render json: { errors: ['Comment not found'] }, status: :not_found unless comment

      authorize_owner_or_admin!(comment)

      Comment.transaction do
        Notification.destroy_for_like_or_comment!(comment)
        comment.soft_delete
      end
      head :no_content
    end

    private

    def set_post
      @post = Post.active.find_by(id: params[:post_id])
      return if @post

      render json: { errors: ['Post not found'] }, status: :not_found
    end

    def comment_params
      params.require(:comment).permit(:body)
    end

    def comment_response(comment)
      {
        id: comment.id,
        body: comment.body,
        user: comment.user ? {
          id: comment.user.id,
          display_name: comment.user.display_name,
          avatar: avatar_response(comment.user)
        } : nil,
        created_at: comment.created_at.iso8601
      }
    end

  end
end
