# frozen_string_literal: true

module Api
  module Users
    # 現在ログイン中のユーザー情報取得・更新用コントローラー
    class MeController < ApplicationController
      # GET /users/me
      # 現在ログインしているユーザーの情報を取得
      def show
        render json: user_response(current_user), status: :ok
      end

      # PATCH /users/me
      # 現在ログインしているユーザーのプロフィールを更新
      def update
        if current_user.update(user_params)
          render json: user_response(current_user), status: :ok
        else
          render json: { errors: current_user.errors }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:display_name, :description, :email)
      end

      def user_response(user)
        {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          description: user.description,
          role: user.role,
          provider: user.provider,
          created_at: user.created_at.iso8601
        }
      end
    end
  end
end
