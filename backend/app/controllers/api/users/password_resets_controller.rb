# frozen_string_literal: true

module Api
  module Users
    # パスワードリセット（リセット要求・リセット実行）用コントローラー
    class PasswordResetsController < ApplicationController
      # 未認証ユーザーが利用するため認証をスキップ
      skip_before_action :authenticate_user!

      # POST /api/users/password_reset
      # パスワードリセット要求（メール送信）
      def create
        user = User.active.find_by(email: create_params[:email])

        if user.present?
          if user.provider.present?
            # OAuthユーザーにはGoogleログイン案内メールを送信
            PasswordResetMailer.oauth_notification(user).deliver_now
          else
            # 通常ユーザーにはリセットトークンを生成してメール送信
            raw_token, enc_token = Devise.token_generator.generate(User, :reset_password_token)
            user.update!(
              reset_password_token: enc_token,
              reset_password_sent_at: Time.current
            )
            PasswordResetMailer.reset_email(user, raw_token).deliver_now
          end
        end

        # アカウント列挙防止のため、常に同じレスポンスを返す
        render json: { message: "メールを送信しました" }, status: :ok
      rescue StandardError => e
        Rails.logger.error("Password reset email error: #{e.message}")
        render json: { message: "メールを送信しました" }, status: :ok
      end

      # PATCH /api/users/password_reset
      # パスワードリセット実行（トークン検証 + パスワード更新）
      def update
        user = User.reset_password_by_token(
          reset_password_token: update_params[:reset_password_token],
          password: update_params[:password],
          password_confirmation: update_params[:password_confirmation]
        )

        if user.errors.empty?
          # リセット成功: JWTトークン発行して自動ログイン
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
