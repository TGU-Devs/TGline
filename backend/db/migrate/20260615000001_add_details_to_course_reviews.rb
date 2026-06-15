# frozen_string_literal: true

class AddDetailsToCourseReviews < ActiveRecord::Migration[7.2]
  def change
    add_column :course_reviews, :exam_presence, :integer, null: false, default: 0, if_not_exists: true
    add_column :course_reviews, :attendance_check, :integer, null: false, default: 0, if_not_exists: true
    add_column :course_reviews, :textbook_required, :boolean, null: false, default: false, if_not_exists: true

    add_index :course_reviews, :exam_presence, if_not_exists: true
    add_index :course_reviews, :attendance_check, if_not_exists: true
  end
end
