# frozen_string_literal: true

module Api
  module Users
    class EmailVerificationsController < ApplicationController
      TOKEN_EXPIRES_IN = 24.hours

      skip_before_action :authenticate_user!

      def create
        user = User.active.find_by(email: create_params[:email])

        if user.present? && user.provider.blank? && !user.email_verified?
          raw_token = user.generate_email_verification_token!
          EmailVerificationMailer.verification_email(user, raw_token).deliver_now
        end

        render json: { message: "認証メールを送信しました" }, status: :ok
      rescue StandardError => e
        Rails.logger.error("Email verification resend error: #{e.message}")
        render json: { message: "認証メールを送信しました" }, status: :ok
      end

      def update
        if update_params[:token].blank?
          return render json: { error: "認証リンクが無効です" }, status: :unprocessable_entity
        end

        token_digest = Devise.token_generator.digest(User, :email_verification_token, update_params[:token])
        user = User.active.find_by(email_verification_token: token_digest)

        unless user
          return render json: { error: "認証リンクが無効です" }, status: :unprocessable_entity
        end

        if user.email_verification_sent_at.blank? || user.email_verification_sent_at < TOKEN_EXPIRES_IN.ago
          return render json: { error: "認証リンクの有効期限が切れています" }, status: :unprocessable_entity
        end

        user.update!(
          email_verified_at: Time.current,
          email_verification_token: nil,
          email_verification_sent_at: nil
        )

        token = JwtService.encode(user.id)

        render json: {
          message: "メール認証が完了しました",
          token: token
        }, status: :ok
      end

      private

      def create_params
        params.require(:email_verification).permit(:email)
      end

      def update_params
        params.require(:email_verification).permit(:token)
      end
    end
  end
end
