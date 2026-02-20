# frozen_string_literal: true

module Api
  module Users
    # Google OAuthログイン用コントローラー
    class GoogleSessionsController < ApplicationController
      skip_before_action :authenticate_user!, only: [:create]

      # POST /api/users/google_sign_in
      # Google IDトークンを検証し、ユーザーを検索/作成してJWTを発行
      def create
        google_service = GoogleAuthService.new
        google_user = google_service.verify(params[:id_token])

        user = find_or_create_user(google_user)

        if user.persisted?
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
            message: 'Googleアカウントでログインしました!'
          }, status: :ok
        else
          render json: { error: 'ユーザーの作成に失敗しました' }, status: :unprocessable_entity
        end
      rescue GoogleAuthService::InvalidToken => e
        render json: { error: e.message }, status: :unauthorized
      end

      private

      # ユーザー検索/作成ロジック
      # 1. provider + uid で検索（既存のGoogleユーザー）
      # 2. 同じメールの既存ユーザーを検索（アカウント自動連携）
      # 3. 新規ユーザー作成
      def find_or_create_user(google_user)
        # 1. Google provider + uid で検索
        user = User.active.find_by(provider: 'google', uid: google_user[:uid])
        return user if user

        # 2. 同じメールの既存ユーザーを検索し、アカウント連携
        user = User.active.find_by(email: google_user[:email])
        if user
          user.update!(provider: 'google', uid: google_user[:uid])
          return user
        end

        # 3. 新規ユーザー作成
        User.create!(
          email: google_user[:email],
          display_name: google_user[:name],
          provider: 'google',
          uid: google_user[:uid]
        )
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
