module Api
  class TimeController < ApplicationController
    # devise-jwtで認証を行わないコントローラーを作成するための設定
    skip_before_action :authenticate_user!, only: [:index, :test_error]

    # テスト用（確認後に削除）
    def test_error
      raise "Discord Webhook テスト"
    end

    def index
      render json: { current_time: Time.now.strftime("%Y-%m-%d %H:%M:%S") }
    end
  end
end