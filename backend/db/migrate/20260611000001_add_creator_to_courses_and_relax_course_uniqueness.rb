# frozen_string_literal: true

class AddCreatorToCoursesAndRelaxCourseUniqueness < ActiveRecord::Migration[7.2]
  def change
    add_reference :courses, :created_by, foreign_key: { to_table: :users }, null: true

    remove_index :courses,
                 column: [:name, :faculty, :department, :category],
                 name: "index_courses_on_name_and_faculty_and_department_and_category",
                 if_exists: true

    add_index :courses, [:name, :faculty, :department, :category]
  end
end
