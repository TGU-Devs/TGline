module Api
  class NotificationsController < ApplicationController
    before_action :set_notification, only: [:update]

    # GET /api/notifications
    def index
      per_page = 20
      page = (params[:page] || 1).to_i

      notifications = Notification
        .for_recipient(current_user)
        .includes(notifiable: :post, actor: { avatar_attachment: :blob })
      if params.key?(:read)
        read_status = ActiveModel::Type::Boolean.new.cast(params[:read])
        notifications = notifications.with_read_status(read_status)
      end
      notifications = notifications
        .limit(per_page + 1)
        .offset((page - 1) * per_page)

      has_next_page = notifications.size > per_page

      render json: {
        notifications: notifications.first(per_page).map { |notification| notification_response(notification) },
        has_next_page: has_next_page
      }
    end

    # PATCH /api/notifications/:id 通知一件を既読化
    def update
      unless notification_params.key?(:read)
        return render json: { error: "read is required" }, status: :unprocessable_entity
      end

      read_at = ActiveModel::Type::Boolean.new.cast(notification_params[:read]) ? Time.current : nil
      @notification.update!(read_at: read_at)

      render json: notification_response(@notification), status: :ok
    end

    private

    def set_notification
      @notification = Notification.for_recipient(current_user).find_by(id: params[:id])
      return if @notification

      render json: { error: "Notification not found" }, status: :not_found
    end

    def notification_params
      params.require(:notification).permit(:read)
    end

    def notification_response(notification)
      post = notification.notifiable&.post

      {
        id: notification.id,
        type: notification.notification_type,
        read: notification.read?,
        actor: notification.actor && {
          id: notification.actor.id,
          display_name: notification.actor.display_name,
          avatar: avatar_response(notification.actor)
        },
        post: post && {
          id: post.id,
          title: post.title
        },
        created_at: notification.created_at.iso8601
      }
    end
  end
end
