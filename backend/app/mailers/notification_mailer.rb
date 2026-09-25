# frozen_string_literal: true

class NotificationMailer < ApplicationMailer
    def comment_notification(notification)
        @recipient = notification.recipient
        @actor_name = notification.actor&.display_name || "誰か"
        set_post(notification.notifiable&.post)
        post_part = @post_title.present? ? "「#{@post_title}」" : ""
        @message = "#{@actor_name}さんが、あなたの投稿#{post_part}にコメントしました。"

        mail(
            to: @recipient.email,
            subject: "あなたの投稿に新しいコメントがつきました！"
        )
    end

    def like_milestone(post, like_count)
        @recipient = post.user
        set_post(post)
        post_part = @post_title.present? ? "「#{@post_title}」" : ""
        @message = "あなたの投稿#{post_part}に#{like_count}件のいいねがつきました。注目を集めています！"

        mail(
            to: @recipient.email,
            subject: "あなたの投稿が注目を集めています！"
        )
    end

    private

    def set_post(post)
        frontend_url = ENV.fetch("FRONTEND_URL", "http://localhost:3000").chomp("/")
        @post_title = post&.title
        @post_url = "#{frontend_url}/posts/#{post&.id}"
    end
end
