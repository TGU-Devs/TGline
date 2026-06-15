# frozen_string_literal: true

class CreateCourses < ActiveRecord::Migration[7.2]
  def change
    create_table :courses do |t|
      t.string :name, null: false
      t.string :faculty, null: false
      t.string :department, null: false
      t.string :category

      t.timestamps
    end

    add_index :courses, :name
    add_index :courses, :faculty
    add_index :courses, :department
    add_index :courses, [:name, :faculty, :department, :category]
  end
end
