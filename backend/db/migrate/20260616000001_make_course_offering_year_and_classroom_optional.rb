# frozen_string_literal: true

class MakeCourseOfferingYearAndClassroomOptional < ActiveRecord::Migration[7.2]
  def change
    change_column_null :course_offerings, :academic_year, true
    change_column_null :course_offerings, :classroom, true
  end
end
