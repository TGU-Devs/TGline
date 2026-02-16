class CreateFeedbacks < ActiveRecord::Migration[7.2]
  def change
    create_table :feedbacks do |t|
      t.references :user, null: false, foreign_key: true
      t.string     :category,    null: false
      t.string     :subject,     null: false
      t.text       :body,        null: false
      t.string     :status,      null: false, default: "pending"
      t.text       :admin_notes
      t.datetime   :reviewed_at
      t.bigint     :reviewed_by
      t.datetime   :deleted_at
      t.timestamps
    end

    add_index :feedbacks, :status
    add_index :feedbacks, :category
    add_index :feedbacks, :created_at
  end
end
