module Api
  class TimeController < ApplicationController
    def index
      render json: { current_time: Time.now.strftime("%Y-%m-%d %H:%M:%S") }
    end
  end
end