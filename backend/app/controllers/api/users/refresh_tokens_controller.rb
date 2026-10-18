# frozen_string_literal: true

module Api
  module Users
    class RefreshTokensController < ApplicationController
      skip_before_action :authenticate_user!

      def create
        authentication_session, refresh_token = AuthenticationSession.rotate!(cookies[:refresh_token])
        set_auth_cookies(authentication_session, refresh_token)

        head :no_content
      rescue AuthenticationSession::InvalidRefreshToken
        clear_auth_cookies
        render json: { error: "invalid_refresh_token" }, status: :unauthorized
      end
    end
  end
end
