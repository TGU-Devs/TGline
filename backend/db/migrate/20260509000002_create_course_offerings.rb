# frozen_string_literal: true

class CreateCourseOfferings < ActiveRecord::Migration[7.2]
  def change
    create_table :course_offerings do |t|
      t.references :course, null: false, foreign_key: true
      t.integer :academic_year, null: false
      t.integer :semester, null: false
      t.string :teacher_name, null: false
      t.integer :day_of_week
      t.integer :period
      t.string :campus, null: false
      t.string :classroom, null: false

      t.timestamps
    end

    add_index :course_offerings, :academic_year
    add_index :course_offerings, :semester
    add_index :course_offerings,
              [:course_id, :academic_year, :semester, :teacher_name, :day_of_week, :period],
              unique: true,
              name: "index_course_offerings_on_unique_schedule"
  end
end
