# frozen_string_literal: true

class CreateCourseReviews < ActiveRecord::Migration[7.2]
  def change
    create_table :course_reviews do |t|
      t.references :course, null: false, foreign_key: true
      t.references :course_offering, null: true, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :rating, null: false
      t.integer :difficulty, null: false
      t.integer :workload, null: false
      t.integer :attendance, null: false
      t.integer :grading, null: false
      t.integer :exam_presence, null: false, default: 0
      t.integer :attendance_check, null: false, default: 0
      t.boolean :textbook_required, null: false, default: false
      t.text :comment
      t.datetime :deleted_at

      t.timestamps
    end

    add_index :course_reviews, [:user_id, :course_id], unique: true
    add_index :course_reviews, :deleted_at
    add_index :course_reviews, :exam_presence
    add_index :course_reviews, :attendance_check
  end
end
