# frozen_string_literal: true

module Api
  # ユーザー情報取得用コントローラー
  class UsersController < ApplicationController
    # ユーザー一覧は認証不要
    skip_before_action :authenticate_user!, only: [:index, :show]

    # GET /users
    # ユーザー一覧を取得（認証不要）
    def index
      users = User.active.order(created_at: :desc)
      render json: users.map { |user|
        {
          id: user.id,
          display_name: user.display_name,
          role: user.role,
          created_at: user.created_at.iso8601
        }
      }, status: :ok
    end

    # GET /users/:id
    # 指定されたユーザーの公開情報を取得
    def show
      # 画像のincludesを images_attachments: :blob に変更し、likes と comments も追加
      user = User.active.includes(
        posts: [:tags, :likes, :comments, { images_attachments: :blob }],
        comments: :post
      ).find_by(id: params[:id])

      if user
        render json: {
          id: user.id,
          display_name: user.display_name,
          description: user.description,
          created_at: user.created_at.iso8601,
          posts: user.posts.map do |post|
            {
              id: post.id,
              title: post.title,
              body: post.body,
              # count メソッドではなく、size 等を使う
              likes_count: post.likes.size,
              current_user_liked: post.likes.any? { |l| l.user_id == current_user&.id },
              comments_count: post.comments.count { |c| c.deleted_at.nil? },
              created_at: post.created_at.iso8601,
              updated_at: post.updated_at.iso8601,
              tags: post.tags.map do |tag|
                {
                  id: tag.id,
                  name: tag.name,
                  category: tag.category
                }
              end,
              # rails_blob_path を使うのがAPIでは安定します
              images: post.images.map do |image|
                {
                  id: image.id,
                  url: Rails.application.routes.url_helpers.rails_blob_path(image, only_path: true),
                  filename: image.filename.to_s,
                  content_type: image.content_type,
                  byte_size: image.byte_size
                }
              end
            }
          end,
          comments: user.comments.map do |comment|
            {
              id: comment.id,
              post_id: comment.post_id,
              body: comment.body,
              created_at: comment.created_at.iso8601,
              post_title: comment.post&.title
            }
          end
        }, status: :ok
      else
        render json: { errors: ['User not found'] }, status: :not_found
      end
    end
  end
end
