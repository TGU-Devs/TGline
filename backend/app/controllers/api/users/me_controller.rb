# frozen_string_literal: true

module Api
  module Users
    class MeController < ApplicationController
      def show
        render json: user_response(current_user), status: :ok
      end

      def destroy
        if current_user.provider.blank?
          current_password = params.dig(:password, :current_password)
          unless current_user.valid_password?(current_password)
            render json: { error: "パスワードが正しくありません" }, status: :unauthorized
            return
          end
        end

        unless current_user.soft_delete
          render json: { error: "アカウント削除に失敗しました" }, status: :internal_server_error
          return
        end

        cookies.delete(:jwt_token, {
          httponly: true,
          secure: Rails.env.production?,
          same_site: :lax
        })

        head :no_content
      end

      def update
        if current_user.provider.present? && user_params.key?(:email)
          return render json: { error: "OAuthユーザーはメールアドレスを変更できません" }, status: :forbidden
        end

        current_user.avatar.purge if ActiveModel::Type::Boolean.new.cast(user_params[:remove_avatar])

        if user_params[:avatar].present?
          current_user.avatar.attach(user_params[:avatar])
        end

        if current_user.update(user_params.except(:avatar, :remove_avatar))
          render json: user_response(current_user.reload), status: :ok
        else
          render json: { errors: current_user.errors }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:display_name, :description, :email, :avatar, :remove_avatar)
      end

      def user_response(user)
        {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          description: user.description,
          role: user.role,
          provider: user.provider,
          created_at: user.created_at.iso8601,
          avatar: avatar_response(user)
        }
      end
    end
  end
end
