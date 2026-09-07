module Api
    class NotificationsController < ApplicationController
        before_action :set_notification, only: [:read]

        # GET /api/notifications
        def index
            per_page = 20
            page = (params[:page] || 1).to_i

            notifications = Notification
             .for_recipient(current_user)
             .includes(:notifiable, actor: { avatar_attachment: :blob })
             .limit(per_page + 1)
             .offset((page - 1) * per_page)
             .order(created_at: :desc)

            has_next_page = notifications.size > per_page

            render json: {
                notifications: notifications.first(per_page).map { |n| notification_response(n) },
                has_next_page: has_next_page
            }
        end

        # GET /api/notifications/unread_count
        def unread_count
            count = Notification.for_recipient(current_user).unread.count
            render json: { count: count }, status: :ok
        end

        # POST /api/notifications/:id/read
        def read
            @notification.mark_as_read!
            render json: notification_response(@notification), status: :ok
        end

        # POST /api/notifications/read_all
        def read_all
            Notification.for_recipient(current_user).unread.update_all(read_at: Time.current)
            head :no_content
        end

        private

        def set_notification
            @notification = Notification.for_recipient(current_user).find_by(id: params[:id])
            return if @notification

            render json: { error: "Notification not found" }, status: :not_found
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
                    avatar: avatar_response(notification.actor),
                },
                post_id: notification.notifiable&.post_id,
                created_at: notification.created_at.iso8601
            }
        end

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