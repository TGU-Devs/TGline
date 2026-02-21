# frozen_string_literal: true

module Api
  class LikesController < ApplicationController
    # POST /api/posts/:post_id/likes
    def create
      post = Post.active.find_by(id: params[:post_id])
      return render json: { errors: ['Post not found'] }, status: :not_found unless post

      like = current_user.likes.build(post: post)

      if like.save
        head :created
      else
        head :unprocessable_entity
      end
    end

    # DELETE /api/posts/:post_id/likes
    def destroy
      post = Post.active.find_by(id: params[:post_id])
      return render json: { errors: ['Post not found'] }, status: :not_found unless post

      like = current_user.likes.find_by(post: post)
      return head :not_found unless like

      like.destroy
      head :no_content
    end
  end
end
