# frozen_string_literal: true

class RequireCourseDepartmentAndLocationFields < ActiveRecord::Migration[7.2]
  def up
    execute "UPDATE courses SET department = '' WHERE department IS NULL"
    execute "UPDATE course_offerings SET campus = '' WHERE campus IS NULL"
    execute "UPDATE course_offerings SET classroom = '' WHERE classroom IS NULL"

    change_column_null :courses, :department, false
    change_column_null :course_offerings, :campus, false
    change_column_null :course_offerings, :classroom, false
  end

  def down
    change_column_null :courses, :department, true
    change_column_null :course_offerings, :campus, true
    change_column_null :course_offerings, :classroom, true
  end
end
