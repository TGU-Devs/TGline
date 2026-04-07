# frozen_string_literal: true

module Api
  # 投稿管理用コントローラー
  class PostsController < ApplicationController
    skip_before_action :authenticate_user!, only: [:index]
    # postが存在するかどうかを確認するメソッド
    before_action :set_post, only: [:show, :update, :destroy]

    # GET /posts
    # 投稿一覧を取得（認証不要）
    def index
      per_page = 20
      page = (params[:page] || 1).to_i
      liked_only = ActiveModel::Type::Boolean.new.cast(params[:liked])

      posts = Post.active.includes(:user, :tags, :likes, :comments).order(created_at: :desc)

      # いいね済み投稿のみ表示（認証必須）
      if liked_only
        unless current_user
          render json: { errors: ['Authentication required'] }, status: :unauthorized
          return
        end

        posts = posts.joins(:likes).where(likes: { user_id: current_user.id }).distinct
      end

      # カテゴリで絞り込み
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

    # GET /posts/:id
    # 投稿詳細を取得（認証必須）
    def show
      render json: post_response(@post), status: :ok
    end

    # POST /posts
    # 投稿を作成（認証必須、ログインユーザーのみ）
    def create
      post = current_user.posts.build(post_params.except(:tag_ids))
      post.tag_ids = post_params[:tag_ids] if post_params[:tag_ids].present?

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

      @post.tag_ids = post_params[:tag_ids] if post_params.key?(:tag_ids)

      if @post.update(post_params.except(:tag_ids))
        render json: post_response(@post.reload), status: :ok
      else
        render json: { errors: @post.errors }, status: :unprocessable_entity
      end
    end

    # DELETE /posts/:id
    # 投稿を論理削除（認証必須、所有者または管理者のみ）
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
      params.require(:post).permit(:title, :body, tag_ids: [])
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
        created_at: post.created_at.iso8601,
        updated_at: post.updated_at.iso8601
      }
    end
  end
end
