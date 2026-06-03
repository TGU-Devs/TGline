# frozen_string_literal: true

module Api
  module Users
    # ユーザー登録（サインアップ）用コントローラー
    class RegistrationsController < ApplicationController
      # サインアップは認証不要
      skip_before_action :authenticate_user!, only: [:create]

      # POST /users/sign_up
      # 新規ユーザー登録
      def create
        user = User.new(user_params)

        unless university_email?(user.email)
          return render json: { error: '東北学院大学のメールアドレスで登録してください。' }, status: :forbidden
        end

        if user.save
          raw_token = user.generate_email_verification_token!
          begin
            EmailVerificationMailer.verification_email(user, raw_token).deliver_now
          rescue StandardError => e
            Rails.logger.error("Email verification send error: #{e.message}")
          end

          render json: {
            message: 'ユーザー登録が完了しました。確認メールを送信したので、メール内リンクから認証してください。',
            requires_email_verification: true
          }, status: :created
        else
          render json: { errors: user.errors }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:email, :password, :password_confirmation, :display_name, :description)
      end
    end
  end
end
