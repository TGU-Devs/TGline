module Api
  module Admin
    class StatsController < ApplicationController
      before_action :authorize_admin!

      def index
        today = Time.current.beginning_of_day..Time.current
        this_week = Time.current.beginning_of_week..Time.current

        render json: {
          counts: {
            users: User.active.count,
            posts: Post.active.count,
            comments: Comment.active.count
          },
          trends: {
            users_today: User.active.where(created_at: today).count,
            users_this_week: User.active.where(created_at: this_week).count,
            posts_today: Post.active.where(created_at: today).count,
            posts_this_week: Post.active.where(created_at: this_week).count,
            comments_today: Comment.active.where(created_at: today).count,
            comments_this_week: Comment.active.where(created_at: this_week).count
          },
          recent_activity: {
            posts: Post.active.includes(:user).order(created_at: :desc).limit(5).map { |p|
              {
                id: p.id,
                title: p.title,
                user_display_name: p.user&.display_name || "匿名",
                created_at: p.created_at.iso8601
              }
            },
            comments: Comment.active.includes(:user, :post).order(created_at: :desc).limit(5).map { |c|
              {
                id: c.id,
                body: c.body.truncate(50),
                user_display_name: c.user&.display_name || "匿名",
                post_title: c.post&.title&.truncate(30) || "削除された投稿",
                post_id: c.post_id,
                created_at: c.created_at.iso8601
              }
            }
          }
        }
      end
    end
  end
end
