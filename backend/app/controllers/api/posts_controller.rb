# frozen_string_literal: true

module Api
  # 投稿管理用コントローラー
  class PostsController < ApplicationController
    # postが存在するかどうかを確認するメソッド
    before_action :set_post, only: [:show, :update, :destroy]

    # GET /posts
    # 投稿一覧を取得（認証必須）
    def index
      posts = Post.active.includes(:user, :tags).order(created_at: :desc)

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

      render json: posts.map { |post| post_response(post) }, status: :ok
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
        created_at: post.created_at.iso8601,
        updated_at: post.updated_at.iso8601
      }
    end
  end
end
