module Api
  class NotificationInboxesController < ApplicationController
    # GET /api/notification_inbox
    def show
      unread_count = Notification.for_recipient(current_user).unread.count

      render json: { unread_count: unread_count }, status: :ok
    end

    # PATCH /api/notification_inbox
    def update
      unless inbox_params.key?(:read) && ActiveModel::Type::Boolean.new.cast(inbox_params[:read])
        return render json: { error: "read must be true" }, status: :unprocessable_entity
      end

      Notification.for_recipient(current_user).unread.update_all(read_at: Time.current)
      head :no_content
    end

    private

    def inbox_params
      params.require(:notification_inbox).permit(:read)
    end
  end
end
