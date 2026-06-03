# frozen_string_literal: true

module Api
  module Users
    class PasswordResetsController < ApplicationController
      skip_before_action :authenticate_user!

      def create
        user = User.active.find_by(email: create_params[:email])

        if user.present?
          if user.provider.present?
            PasswordResetMailer.oauth_notification(user).deliver_now
          else
            raw_token, enc_token = Devise.token_generator.generate(User, :reset_password_token)
            user.update!(
              reset_password_token: enc_token,
              reset_password_sent_at: Time.current
            )
            PasswordResetMailer.reset_email(user, raw_token).deliver_now
          end
        end

        render json: { message: "メールを送信しました" }, status: :ok
      rescue StandardError => e
        Rails.logger.error("Password reset email error: #{e.message}")
        render json: { message: "メールを送信しました" }, status: :ok
      end

      def update
        user = User.reset_password_by_token(
          reset_password_token: update_params[:reset_password_token],
          password: update_params[:password],
          password_confirmation: update_params[:password_confirmation]
        )

        if user.errors.empty?
          token = JwtService.encode(user.id)

          cookies[:jwt_token] = {
            value: token,
            httponly: true,
            secure: Rails.env.production?,
            same_site: :lax,
            expires: 7.days.from_now
          }

          render json: {
            user: {
              id: user.id,
              email: user.email,
              display_name: user.display_name,
              role: user.role
            },
            token: token
          }, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def create_params
        params.require(:password_reset).permit(:email)
      end

      def update_params
        params.require(:password_reset).permit(:reset_password_token, :password, :password_confirmation)
      end
    end
  end
end
