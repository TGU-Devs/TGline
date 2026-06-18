# frozen_string_literal: true

class CourseReview < ApplicationRecord
  SCORE_RANGE = 1..5

  belongs_to :course
  belongs_to :course_offering, optional: true
  belongs_to :user

  enum :exam_presence, { none: 0, sometimes: 1, yes: 2 }, prefix: true
  enum :attendance_check, { none: 0, sometimes: 1, yes: 2 }, prefix: true

  validates :rating, :difficulty, :workload, :grading,
            presence: true,
            numericality: { only_integer: true },
            inclusion: { in: SCORE_RANGE }
  validates :exam_presence, :attendance_check, presence: true
  validates :textbook_required, inclusion: { in: [true, false] }
  validates :comment, length: { maximum: 5000 }, allow_blank: true
  validates :user_id, uniqueness: { scope: :course_id, conditions: -> { where(deleted_at: nil) } }
  validate :course_offering_belongs_to_course

  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }

  def soft_delete
    update(deleted_at: Time.current)
  end

  def deleted?
    deleted_at.present?
  end

  private

  def course_offering_belongs_to_course
    return if course_offering.blank?
    return if course_offering.course_id == course_id

    errors.add(:course_offering, "must belong to the selected course")
  end
end
