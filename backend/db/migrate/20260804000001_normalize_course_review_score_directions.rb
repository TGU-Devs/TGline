# frozen_string_literal: true

class NormalizeCourseReviewScoreDirections < ActiveRecord::Migration[7.2]
  def up
    reverse_difficulty_and_workload_scores
  end

  def down
    reverse_difficulty_and_workload_scores
  end

  private

  def reverse_difficulty_and_workload_scores
    execute <<~SQL.squish
      UPDATE course_reviews
      SET
        difficulty = 6 - difficulty,
        workload = 6 - workload
      WHERE difficulty BETWEEN 1 AND 5
        AND workload BETWEEN 1 AND 5
    SQL
  end
end
