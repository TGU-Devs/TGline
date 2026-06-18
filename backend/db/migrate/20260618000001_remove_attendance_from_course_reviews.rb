# frozen_string_literal: true

class RemoveAttendanceFromCourseReviews < ActiveRecord::Migration[7.2]
  def change
    remove_column :course_reviews, :attendance, :integer, if_exists: true
  end
end
