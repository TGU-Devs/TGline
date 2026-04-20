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
          token = JwtService.encode(user.id) # JWTServiceはlib/jwt_service.rbにあるクラスで、JWTトークンを生成する
          
          # JWTトークンをcookieに設定
          cookies[:jwt_token] = {
            value: token,
            httponly: true, # JavaScriptからアクセス不可（XSS対策）
            secure: Rails.env.production?, # HTTPS接続でのみ送信（本番環境）
            same_site: :lax, # CSRF対策(同じドメイン間のみCookieを送信)
            expires: 7.days.from_now # 7日間有効
          }
          
          render json: {
            user: user_response(user),
            token: token,
            message: 'ユーザー登録が完了しました！'
          }, status: :created
        else
          render json: { errors: user.errors }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:email, :password, :password_confirmation, :display_name, :description)
      end

      def user_response(user)
        {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          description: user.description,
          role: user.role
        }
      end
    end
  end
end
