module Api
  class NotificationsController < ApplicationController
    before_action :set_notification, only: [:update]

    # GET /api/notifications
    def index
      per_page = 20
      page = (params[:page] || 1).to_i

      notifications = Notification
        .for_recipient(current_user)
        .includes(:notifiable, actor: { avatar_attachment: :blob })
      notifications = filter_by_read_status(notifications)
      notifications = notifications
        .limit(per_page + 1)
        .offset((page - 1) * per_page)

      has_next_page = notifications.size > per_page

      render json: {
        notifications: notifications.first(per_page).map { |notification| notification_response(notification) },
        has_next_page: has_next_page
      }
    end

    # PATCH /api/notifications/:id
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

    def filter_by_read_status(notifications)
      return notifications unless params.key?(:read)

      if ActiveModel::Type::Boolean.new.cast(params[:read])
        notifications.where.not(read_at: nil)
      else
        notifications.unread
      end
    end

    def notification_response(notification)
      {
        id: notification.id,
        kind: notification.kind,
        read: notification.read?,
        message: notification_message(notification),
        actor: notification.actor && {
          id: notification.actor.id,
          display_name: notification.actor.display_name,
          avatar: avatar_response(notification.actor)
        },
        post_id: notification.notifiable&.post_id,
        created_at: notification.created_at.iso8601
      }
    end
 # バックエンド側でメッセージ文言まで作るのは必要ない気がする...
    def notification_message(notification)
      name = notification.actor&.display_name || "誰か"
      title = notification.notifiable&.post&.title
      post_part = title.present? ? "「#{title}」" : ""

      if notification.like?
        "#{name}があなたの投稿#{post_part}にいいねしました"
      else
        "#{name}があなたの投稿#{post_part}にコメントしました"
      end
    end
  end
end
