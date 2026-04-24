# frozen_string_literal: true

module Authenticable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  def current_user
    @current_user ||= begin
      token = extract_token
      return nil unless token

      user_id = JwtService.user_id_from_token(token)
      return nil unless user_id

      User.active.find_by(id: user_id)
    rescue StandardError => e
      Rails.logger.error("Authentication error: #{e.message}")
      nil
    end
  end

  def authenticate_user!
    return if current_user

    token = extract_token
    if token
      begin
        JwtService.decode(token)
      rescue JWT::ExpiredSignature
        render json: { error: 'token_expired' }, status: :unauthorized
        return
      rescue JWT::DecodeError
      end
    end

    render json: { error: 'unauthorized' }, status: :unauthorized
  end

  private

  def extract_token
    cookies[:jwt_token] if cookies[:jwt_token].present?
  end
end
