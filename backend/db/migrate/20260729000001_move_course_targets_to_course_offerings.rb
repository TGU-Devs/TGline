# frozen_string_literal: true

class MoveCourseTargetsToCourseOfferings < ActiveRecord::Migration[7.2]
  def up
    add_column :course_offerings, :faculty, :string
    add_column :course_offerings, :department, :string
    add_index :course_offerings, :faculty
    add_index :course_offerings, :department

    execute <<~SQL.squish
      UPDATE course_offerings
      SET
        faculty = CASE WHEN courses.category = '教養科目' THEN NULL ELSE courses.faculty END,
        department = CASE WHEN courses.category = '教養科目' THEN NULL ELSE courses.department END
      FROM courses
      WHERE courses.id = course_offerings.course_id
    SQL

    change_column_null :courses, :faculty, true
    change_column_null :courses, :department, true
  end

  def down
    execute "UPDATE courses SET faculty = '全学部' WHERE faculty IS NULL"
    execute "UPDATE courses SET department = '全学科' WHERE department IS NULL"
    change_column_null :courses, :faculty, false
    change_column_null :courses, :department, false

    remove_index :course_offerings, :department
    remove_index :course_offerings, :faculty
    remove_column :course_offerings, :department
    remove_column :course_offerings, :faculty
  end
end
