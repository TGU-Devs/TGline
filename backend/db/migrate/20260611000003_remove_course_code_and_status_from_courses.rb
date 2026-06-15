# frozen_string_literal: true

class RemoveCourseCodeAndStatusFromCourses < ActiveRecord::Migration[7.2]
  def change
    remove_index :courses, column: :course_code, if_exists: true
    remove_column :courses, :course_code, :string, if_exists: true
    remove_column :courses, :status, :integer, if_exists: true

    remove_column :course_offerings, :status, :integer, if_exists: true
  end
end
