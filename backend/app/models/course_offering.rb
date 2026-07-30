class CourseOffering < ApplicationRecord
  belongs_to :course
  has_many :course_reviews, dependent: :restrict_with_error

  enum :semester, { first: 0, second: 1, full_year: 2, intensive: 3, other: 4 }, prefix: true
  enum :day_of_week, {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
    other_day: 7
  }, prefix: true
  enum :delivery_method, { in_person: 0, remote: 1 }, prefix: true
  enum :target_grade, { all_grades: 0, first_year: 1, second_year: 2, third_year: 3, fourth_year: 4 }, prefix: true

  validates :academic_year, numericality: { only_integer: true, greater_than_or_equal_to: 2000 }, allow_nil: true
  validates :semester, presence: true
  validates :delivery_method, presence: true
  validates :target_grade, presence: true
  validates :teacher_name, presence: true
  validates :campus, presence: true
  validates :period, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :course_id, uniqueness: {
    scope: [:academic_year, :semester, :teacher_name, :day_of_week, :delivery_method, :target_grade, :period],
    message: "has already been offered with the same schedule"
  }
  validate :faculty_and_department_match_category

  private

  def faculty_and_department_match_category
    return if course.blank?

    if course.category == "教養科目"
      errors.add(:faculty, "must be blank for a general education course") if faculty.present?
      errors.add(:department, "must be blank for a general education course") if department.present?
      return
    end

    errors.add(:faculty, "can't be blank") if faculty.blank?
    errors.add(:department, "can't be blank") if department.blank?
  end
end
