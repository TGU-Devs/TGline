class CreateNotifications < ActiveRecord::Migration[7.2]
  def change
    create_table :notifications do |t|
      t.bigint :recipient_id, null: false # 通知を受け取るユーザーのID
      t.bigint :actor_id, null: false # 通知を送信したユーザーのID
      t.string :notifiable_type, null: false # 通知対象のモデル名
      t.bigint :notifiable_id, null: false # 通知対象のモデルのID
      t.integer :kind, null: false # 通知の種類 (画面表示用)
      t.datetime :read_at # 通知を既読にした日時

      t.timestamps
    end

    add_foreign_key :notifications, :users, column: :recipient_id
    add_foreign_key :notifications, :users, column: :actor_id

    add_index :notifications, :actor_id
    add_index :notifications, [:recipient_id, :created_at], order: { created_at: :desc }
    add_index :notifications, [:notifiable_type, :notifiable_id, :recipient_id],
              unique: true, name: "index_notifications_on_notifiable_and_recipient"
  end
end
