# frozen_string_literal: true

module Api
  module Users
    # Google OAuthログイン用コントローラー
    class GoogleSessionsController < ApplicationController
      class EmailAlreadyTaken < StandardError; end

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
            token: token,
            message: 'Googleアカウントでログインしました!'
          }, status: :ok
        else
          render json: { error: 'ユーザーの作成に失敗しました' }, status: :unprocessable_entity
        end
      rescue GoogleAuthService::InvalidToken => e
        render json: { error: e.message }, status: :unauthorized
      rescue EmailAlreadyTaken
        render json: { error: 'このメールアドレスは既にメール/パスワードで登録されています。メール/パスワードでログインしてください。' }, status: :conflict
      end

      private

      # ユーザー検索/作成ロジック
      # 1. provider + uid で検索（既存のGoogleユーザー）
      # 2. 同じメールの既存ユーザーが存在する場合はエラー（乗っ取り防止）
      # 3. 新規ユーザー作成
      def find_or_create_user(google_user)
        # 1. Google provider + uid で検索（アクティブユーザー）
        user = User.active.find_by(provider: 'google', uid: google_user[:uid])
        return user if user

        # 2. 論理削除済みの同一Googleアカウントがあれば復活
        deleted_user = User.deleted.find_by(provider: 'google', uid: google_user[:uid])
        if deleted_user
          deleted_user.update!(deleted_at: nil)
          return deleted_user
        end

        # 3. 同じメールの既存ユーザーが存在する場合はエラー（乗っ取り防止）
        if User.active.exists?(email: google_user[:email])
          raise EmailAlreadyTaken
        end

        # 4. 新規ユーザー作成
        User.create!(
          email: google_user[:email],
          display_name: google_user[:name] || google_user[:email].split('@').first, # Googleの名前がない場合はメールアドレスの@以前の部分を表示
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
