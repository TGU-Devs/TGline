# frozen_string_literal: true

class AddDeliveryMethodAndTargetGradeToCourseOfferings < ActiveRecord::Migration[7.2]
  def change
    add_column :course_offerings, :delivery_method, :integer, null: false, default: 0
    add_column :course_offerings, :target_grade, :integer, null: false, default: 0

    remove_index :course_offerings, name: "index_course_offerings_on_unique_schedule", if_exists: true
    add_index :course_offerings, :delivery_method
    add_index :course_offerings, :target_grade
    add_index :course_offerings,
              [:course_id, :academic_year, :semester, :teacher_name, :day_of_week, :delivery_method, :target_grade, :period],
              unique: true,
              name: "index_course_offerings_on_unique_schedule"
  end
end
