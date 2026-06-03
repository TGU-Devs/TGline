# frozen_string_literal: true

module Api
  module Users
    class SessionsController < ApplicationController
      skip_before_action :authenticate_user!, only: [:create, :destroy]

      def create
        user = User.active.find_by(email: session_params[:email])

        if user&.provider.present?
          return render json: { error: 'このメールアドレスはGoogleアカウントで登録されています。Googleログインを使用してください。' }, status: :forbidden
        end

        if user&.valid_password?(session_params[:password])
          unless user.email_verified?
            return render json: {
              error: "メールアドレスが認証されていません。確認メールを再送して認証してください。",
              requires_email_verification: true
            }, status: :forbidden
          end

          token = JwtService.encode(user.id)

          cookies[:jwt_token] = {
            value: token,
            httponly: true,
            secure: Rails.env.production?,
            same_site: :lax,
            expires: 7.days.from_now
          }

          render json: {
            user: user_response(user),
            token: token,
            message: 'サインインに成功しました!'
          }, status: :ok
        else
          render json: { error: 'メールアドレスまたはパスワードが正しくありません' }, status: :unauthorized
        end
      end

      def destroy
        cookies.delete(:jwt_token, {
          httponly: true,
          secure: Rails.env.production?,
          same_site: :lax
        })

        head :no_content
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
