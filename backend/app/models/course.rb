# frozen_string_literal: true

class Course < ApplicationRecord
  CATEGORIES = ["教養科目", "専門科目", "外国語科目", "教職科目"].freeze

  belongs_to :created_by, class_name: "User", optional: true
  has_many :course_offerings, -> { order(academic_year: :desc, semester: :asc, id: :asc) }, dependent: :restrict_with_error
  has_many :course_reviews, dependent: :restrict_with_error

  validates :name, presence: true
  validates :faculty, presence: true
  validates :department, presence: true
  validates :category, presence: true, inclusion: { in: CATEGORIES }
end
