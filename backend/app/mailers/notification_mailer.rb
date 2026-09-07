# frozen_string_literal: true

class NotificationMailer < ApplicationMailer
    layout false
    default from: ENV.fetch("MAILER_FROM_ADDRESS", "noreply@tgline.example.com")

    def notify(notification)
        @notification = notification
        @recipient = notification.recipient
        @actor_name = notification.actor&.display_name || "誰か"
        @post_title = notification.notifiable&.post&.title
        @post_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3000').chomp('/')}/posts/#{notification.notifiable&.post_id}"
        @message = notification_message(notification)

        mail(
            to: @recipient.email,
            subject: email_subject(notification)
        )
    end

    private

    def email_subject(notification)
        if notification.like?
            "#{@actor_name}があなたの投稿にいいねしました"
        else
            "#{@actor_name}があなたの投稿にコメントしました"
        end
    end

    def notification_message(notification)
        post_part = @post_title.present? ? "「#{@post_title}」" : ""

        if notification.like?
            "#{@actor_name}があなたの投稿#{post_part}にいいねしました"
        else
            "#{@actor_name}があなたの投稿#{post_part}にコメントしました"
        end
    end
end