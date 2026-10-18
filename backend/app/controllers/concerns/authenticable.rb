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

  def start_authentication_session(user)
    revoke_authentication_session(cookies[:refresh_token]) if cookies[:refresh_token].present?
    authentication_session, refresh_token = AuthenticationSession.start_for!(user)
    set_auth_cookies(authentication_session, refresh_token)
  end

  def set_auth_cookies(authentication_session, refresh_token)
    access_token = JwtService.encode(authentication_session.user_id)

    cookies[:jwt_token] = shared_cookie_options.merge(
      value: access_token,
      expires: authentication_session.expires_at
    )
    cookies[:refresh_token] = refresh_cookie_options.merge(
      value: refresh_token,
      expires: authentication_session.expires_at
    )
  end

  def clear_auth_cookies
    cookies.delete(:jwt_token, shared_cookie_options)
    cookies.delete(:refresh_token, refresh_cookie_options)
  end

  def revoke_authentication_session(raw_refresh_token)
    AuthenticationSession.revoke_by_refresh_token(raw_refresh_token)
  end

  def revoke_all_authentication_sessions(user)
    AuthenticationSession.revoke_all_for(user)
  end

  private

  def shared_cookie_options
    {
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax,
      domain: ENV['COOKIE_DOMAIN'].presence
    }.compact
  end

  def refresh_cookie_options
    {
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax,
      path: "/api/users"
    }
  end

  def extract_token
    cookies[:jwt_token] if cookies[:jwt_token].present?
  end
end
