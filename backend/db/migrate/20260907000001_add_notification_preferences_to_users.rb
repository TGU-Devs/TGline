# frozen_string_literal: true

class AddNotificationPreferencesToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :notify_email, :boolean, default: true, null: false
    add_column :users, :notify_email_like, :boolean, default: true, null: false
    add_column :users, :notify_email_comment, :boolean, default: true, null: false
  end
end
