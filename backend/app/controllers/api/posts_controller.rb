# frozen_string_literal: true

module Api
  # 投稿管理用コントローラー
  class PostsController < ApplicationController
    skip_before_action :authenticate_user!, only: [:index]
    # postが存在するかどうかを確認するメソッド
    before_action :set_post, only: [:show, :update, :destroy]


    def index
      per_page = 20
      page = (params[:page] || 1).to_i
      liked_only = ActiveModel::Type::Boolean.new.cast(params[:liked])

      posts = Post.active.with_attached_images.includes(:user, :tags, :likes, :comments).order(created_at: :desc)


      if liked_only
        unless current_user
          render json: { errors: ['Authentication required'] }, status: :unauthorized
          return
        end

        posts = posts.joins(:likes).where(likes: { user_id: current_user.id }).reorder("likes.created_at DESC")
      end


      # もしクエリパラメーターがあれば、そのカテゴリの投稿を取得して上書き
      if params[:category].present?
        category_value = Tag.categories[params[:category]]
        posts = posts.joins(:tags).where(tags: { category: category_value }).distinct if category_value
      end

      # もしタグ(個別タグ)がクエリパラメーターにあれば、そのタグの投稿を取得して上書き
      if params[:tag_id].present?
        posts = posts.joins(:tags).where(tags: { id: params[:tag_id] }).distinct
      end

      # ページネーション: 1件多く取得して次ページの有無を判定
      posts = posts.limit(per_page + 1).offset((page - 1) * per_page)
      has_next = posts.size > per_page

      render json: {
        posts: posts.first(per_page).map { |post| post_response(post) },
        has_next: has_next
      }, status: :ok
    end


    def show
      render json: post_response(@post), status: :ok
    end


    def create
      post = current_user.posts.build(post_params.except(:tag_ids, :images, :remove_image_ids))
      post.tag_ids = normalized_tag_ids if post_params.key?(:tag_ids)
      post.images.attach(post_params[:images]) if post_params[:images].present?

      if post.save
        render json: post_response(post), status: :created
      else
        render json: { errors: post.errors }, status: :unprocessable_entity
      end
    end

    # PATCH /posts/:id
    # 投稿を更新（認証必須、所有者のみ）
    def update
      authorize_owner!(@post)

      @post.tag_ids = normalized_tag_ids if post_params.key?(:tag_ids)
      @post.assign_attributes(post_params.except(:tag_ids, :images, :remove_image_ids))

      unless @post.valid?
        render json: { errors: @post.errors }, status: :unprocessable_entity
        return
      end

      purge_removed_images
      @post.images.attach(post_params[:images]) if post_params[:images].present?

      if @post.save
        render json: post_response(@post.reload), status: :ok
      else
        render json: { errors: @post.errors }, status: :unprocessable_entity
      end
    end


    def destroy
      authorize_owner_or_admin!(@post)

      @post.soft_delete
      head :no_content
    end

    private

    # 投稿を取得（論理削除済みは404）
    def set_post
      @post = Post.active.find_by(id: params[:id])
      return if @post

      render json: { errors: ['Post not found'] }, status: :not_found
    end

    # Strong Parameters
    def post_params
      params.require(:post).permit(:title, :body, tag_ids: [], images: [], remove_image_ids: [])
    end

    def normalized_tag_ids
      Array(post_params[:tag_ids]).reject(&:blank?)
    end

    def normalized_remove_image_ids
      Array(post_params[:remove_image_ids]).reject(&:blank?)
    end

    def purge_removed_images
      return if normalized_remove_image_ids.empty?

      @post.images.attachments.where(id: normalized_remove_image_ids).find_each(&:purge)
    end

    # 投稿レスポンス形式
    def post_response(post)
      {
        id: post.id,
        title: post.title,
        body: post.body,
        user: post.user ? {
          id: post.user.id,
          display_name: post.user.display_name
        } : nil,
        tags: post.tags.map { |tag|
          {
            id: tag.id,
            name: tag.name,
            category: tag.category
          }
        },
        likes_count: post.likes.size,
        current_user_liked: post.likes.any? { |l| l.user_id == current_user&.id },
        comments_count: post.comments.count { |c| c.deleted_at.nil? },
        images: image_response(post),
        created_at: post.created_at.iso8601,
        updated_at: post.updated_at.iso8601
      }
    end

    def image_response(post)
      post.images.map do |image|
        {
          id: image.id,
          url: "#{public_backend_url}#{rails_blob_path(image, only_path: true)}",
          filename: image.filename.to_s,
          content_type: image.content_type,
          byte_size: image.byte_size
        }
      end
    end

    def public_backend_url
      ENV.fetch('NEXT_PUBLIC_API_URL', request.base_url).delete_suffix('/')
    end
  end
end
