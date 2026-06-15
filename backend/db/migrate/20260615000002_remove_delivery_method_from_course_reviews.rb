# frozen_string_literal: true

class RemoveDeliveryMethodFromCourseReviews < ActiveRecord::Migration[7.2]
  def change
    remove_index :course_reviews, column: :delivery_method, if_exists: true
    remove_column :course_reviews, :delivery_method, :integer, if_exists: true
  end
end
