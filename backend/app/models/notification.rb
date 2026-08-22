class Notification < ApplicationRecord
    NOTIFIABLE_TYPES = %w[Like Comment].freeze
    KINDS = { like: 0, comment: 1 }.freeze

    belongs_to :recipient, class_name: "User"
    belongs_to :actor, class_name: "User"
    belongs_to :notifiable, polymorphic: true
      
    enum :kind, KINDS
  
    validates :notifiable_type, inclusion: { in: NOTIFIABLE_TYPES }
    validates :notifiable_id, uniqueness: { scope: [:notifiable_type, :recipient_id] }
  
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
  end
