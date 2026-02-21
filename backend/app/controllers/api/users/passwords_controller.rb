# frozen_string_literal: true

module Api
  module Users
    # パスワード変更用コントローラー
    class PasswordsController < ApplicationController
      # PATCH /users/password
      # 現在のパスワードを検証して新しいパスワードに変更
      def update
        if current_user.provider.present?
          return render json: { error: "ソーシャルログインユーザーはパスワードを変更できません" }, status: :forbidden
        end

        unless current_user.valid_password?(password_params[:current_password])
          return render json: { error: "現在のパスワードが正しくありません" }, status: :unauthorized
        end

        if current_user.update(password: password_params[:new_password])
          render json: { message: "パスワードを変更しました" }, status: :ok
        else
          render json: { errors: current_user.errors }, status: :unprocessable_entity
        end
      end

      private

      def password_params
        params.require(:password).permit(:current_password, :new_password)
      end
    end
  end
end
