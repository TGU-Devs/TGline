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

      if comment.save
        render json: comment_response(comment), status: :created
      else
        render json: { errors: comment.errors }, status: :unprocessable_entity
      end
    end

    # DELETE /api/posts/:post_id/comments/:id
    def destroy
      comment = @post.comments.active.find_by(id: params[:id])
      return render json: { errors: ['Comment not found'] }, status: :not_found unless comment

      authorize_owner_or_admin!(comment)

      comment.soft_delete
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

    def public_backend_url
      ENV.fetch('BACKEND_PUBLIC_URL', request.base_url).delete_suffix('/')
    end

    def avatar_response(user)
      return nil unless user.avatar.attached?

      {
        url: "#{public_backend_url}#{rails_blob_path(user.avatar, only_path: true)}",
        content_type: user.avatar.content_type,
        byte_size: user.avatar.byte_size
      }
    end
  end
end
