# frozen_string_literal: true

class CommentNotificationEmailJob < ApplicationJob
  queue_as :mailers

  def perform(notification_id)
    notification = Notification.find_by(id: notification_id)
    return unless notification
    return unless notification.recipient.email_notification_enabled_for?(:comment)

    NotificationMailer.comment_notification(notification).deliver_now
  end
end
