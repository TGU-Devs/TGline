# frozen_string_literal: true

# 認証関連のconcern(共通のメソッドをまとめたモジュール)コントローラーで使用する
# JWTトークンからユーザーを取得し、認証を行う
module Authenticable
  extend ActiveSupport::Concern # Railsが提供するConcernパターンを使うための宣言

  # このモジュール(Authenticable)をincludeしたコントローラーに、before_action :authenticate_user!を自動的に設定する
  included do
    before_action :authenticate_user!
  end

  # 現在ログインしているユーザーを取得
  # @return [User, nil] ログイン中のユーザー、未ログインの場合はnil
  def current_user
    @current_user ||= begin
      token = extract_token # cookieまたはAuthorizationヘッダーから取得
      return nil unless token

      user_id = JwtService.user_id_from_token(token)
      return nil unless user_id

      User.active.find_by(id: user_id)
    rescue StandardError => e
      Rails.logger.error("Authentication error: #{e.message}")
      nil
    end
  end

  # 認証が必要なアクションで使用
  # 未ログインの場合は401エラーを返す
  def authenticate_user!
    return if current_user

    # トークンが存在するが無効な場合（期限切れなど）
    token = extract_token
    if token
      begin
        JwtService.decode(token)
      rescue JWT::ExpiredSignature
        render json: { error: 'token_expired' }, status: :unauthorized
        return
      rescue JWT::DecodeError
        # 無効なトークンの場合は通常のunauthorizedエラー
      end
    end

    render json: { error: 'unauthorized' }, status: :unauthorized
  end

  private

  # cookieからトークンを取得
  # @return [String, nil] トークン、存在しない場合はnil
  def extract_token
    cookies[:jwt_token] if cookies[:jwt_token].present?
  end
end
