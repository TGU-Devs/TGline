# frozen_string_literal: true

module Api
  module Users
    # セッション管理（ログイン・ログアウト）用コントローラー
    class SessionsController < ApplicationController
      # ログインは認証不要
      skip_before_action :authenticate_user!, only: [:create]

      # POST /users/sign_in
      # ログイン
      def create
        user = User.active.find_by(email: session_params[:email])

        if user&.valid_password?(session_params[:password])
          token = JwtService.encode(user.id)
          
          # JWTトークンをcookieに設定
          cookies[:jwt_token] = {
            value: token,
            httponly: true, # JavaScriptからアクセス不可（XSS対策）
            secure: Rails.env.production?, # HTTPS接続でのみ送信（本番環境のみ）
            same_site: :lax, # CSRF対策
            expires: 7.days.from_now # 7日間有効
          }
          
          render json: {
            user: user_response(user),
            message: 'Signed in successfully'
          }, status: :ok
        else
          render json: { error: 'Invalid Email or password' }, status: :unauthorized
        end
      end

      # DELETE /users/sign_out
      # ログアウト（cookieからトークンを削除）
      def destroy
        # cookieからトークンを削除
        cookies.delete(:jwt_token, {
          httponly: true,
          secure: Rails.env.production?,
          same_site: :lax
        })
        head :no_content # 204でbodyを返さない
      end

      private

      def session_params
        params.require(:session).permit(:email, :password)
      end

      def user_response(user)
        {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role
        }
      end
    end
  end
end
