module Api
  class TimeController < ApplicationController
    skip_before_action :authenticate_user!, only: [:index]

    def index
      render json: { current_time: Time.now.strftime("%Y-%m-%d %H:%M:%S") }
    end
  end
end
