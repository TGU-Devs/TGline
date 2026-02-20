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
      user = User.active.find_by(id: params[:id])

      if user
        render json: {
          id: user.id,
          display_name: user.display_name,
          description: user.description,
          created_at: user.created_at.iso8601
        }, status: :ok
      else
        render json: { errors: ['User not found'] }, status: :not_found
      end
    end
  end
end
