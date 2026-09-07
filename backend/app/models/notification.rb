class Notification < ApplicationRecord
    NOTIFIABLE_TYPES = %w[Like Comment].freeze
    KINDS = { like: 0, comment: 1 }.freeze

    belongs_to :recipient, class_name: "User"
    belongs_to :actor, class_name: "User"
    belongs_to :notifiable, polymorphic: true
      
    enum :kind, KINDS
  
    validates :notifiable_type, inclusion: { in: NOTIFIABLE_TYPES }
    validates :notifiable_id, uniqueness: { scope: [:notifiable_type, :recipient_id] }

    after_create_commit :deliver_notification_email
  
    #未読通知の取得
    scope :unread, -> { where(read_at: nil) } 
    #ユーザーの通知の取得
    scope :for_recipient, ->(user) { where(recipient_id: user.id).order(created_at: :desc) } 
  
    #通知が既読かどうかの判定
    def read? 
      read_at.present?
    end
  
    #通知を既読にする
    def mark_as_read! 
      update!(read_at: Time.current) if read_at.nil?
    end

    def self.create_for_like!(like)
      return if like.user_id == like.post.user_id #自分がいいねした場合は通知を作成しない

      create!(
        recipient: like.post.user, #通知を受け取るユーザー
        actor: like.user, #通知を送信したユーザー
        notifiable: like, #通知対象のモデル
        kind: :like #通知の種類
      )
    end

    def self.create_for_comment!(comment)
      return if comment.user_id == comment.post.user_id #自分がコメントした場合は通知を作成しない

      create!(
        recipient: comment.post.user, #通知を受け取るユーザー
        actor: comment.user, #通知を送信したユーザー
        notifiable: comment, #通知対象のモデル
        kind: :comment #通知の種類
      )
    end

    #いいね,コメントを削除した場合の通知の削除
    def self.destroy_for_like_or_comment!(record)
      where(notifiable: record).destroy_all
    end

    private

    #通知メールの送信
    def deliver_notification_email
      return unless recipient.wants_email_for?(kind)

      NotificationMailer.notify(self).deliver_now
    rescue StandardError => e
      Rails.logger.error("Notification email failed: #{e.message}")
    end
  end
