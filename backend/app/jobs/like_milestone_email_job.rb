# frozen_string_literal: true

class LikeMilestoneEmailJob < ApplicationJob
  THRESHOLD = 5

  queue_as :mailers

  def perform(post_id)
    post = Post.active.find_by(id: post_id)
    return unless post
    return unless post.user.email_notification_enabled_for?(:like)

    NotificationMailer.like_milestone(post, THRESHOLD).deliver_now
  end
end
