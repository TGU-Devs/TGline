# frozen_string_literal: true

class ChangeCourseReviewUniquenessToOffering < ActiveRecord::Migration[7.2]
  def change
    remove_index :course_reviews, name: "index_active_course_reviews_on_user_id_and_course_id", if_exists: true
    remove_index :course_reviews, column: [:user_id, :course_id], if_exists: true

    add_index :course_reviews,
              [:user_id, :course_offering_id],
              unique: true,
              where: "deleted_at IS NULL AND course_offering_id IS NOT NULL",
              name: "index_active_course_reviews_on_user_id_and_course_offering_id"

    add_index :course_reviews,
              [:user_id, :course_id],
              unique: true,
              where: "deleted_at IS NULL AND course_offering_id IS NULL",
              name: "index_active_course_level_reviews_on_user_id_and_course_id"
  end
end
