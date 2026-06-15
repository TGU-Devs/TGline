# frozen_string_literal: true

require "csv"

class CourseImporter
  DEFAULT_COURSES_PATH = Rails.root.join("db/csv/courses.csv")
  DEFAULT_OFFERINGS_PATH = Rails.root.join("db/csv/course_offerings.csv")

  def initialize(courses_path: DEFAULT_COURSES_PATH, offerings_path: DEFAULT_OFFERINGS_PATH, logger: Rails.logger)
    @courses_path = courses_path
    @offerings_path = offerings_path
    @logger = logger
  end

  def import!
    import_courses!
    import_course_offerings!
  end

  private

  attr_reader :courses_path, :offerings_path, :logger

  def import_courses!
    return log("Courses CSV not found: #{courses_path}") unless File.exist?(courses_path)

    stats = empty_stats

    CSV.foreach(courses_path, headers: true).with_index(2) do |row, line_number|
      course = Course.find_or_initialize_by(
        name: required_value(row, "name"),
        faculty: required_value(row, "faculty"),
        department: required_value(row, "department")
      )
      stats[:created] += 1 if course.new_record?

      course.assign_attributes(
        category: row["category"]
      )
      course.save!
      stats[:processed] += 1
    rescue StandardError => e
      stats[:errors] += 1
      log("courses.csv line #{line_number}: #{e.class} #{e.message}")
    end

    log("Courses import processed=#{stats[:processed]} created=#{stats[:created]} errors=#{stats[:errors]}")
  end

  def import_course_offerings!
    return log("Course offerings CSV not found: #{offerings_path}") unless File.exist?(offerings_path)

    stats = empty_stats

    CSV.foreach(offerings_path, headers: true).with_index(2) do |row, line_number|
      course = Course.find_by!(
        name: required_value(row, "name"),
        faculty: required_value(row, "faculty"),
        department: required_value(row, "department")
      )
      offering = CourseOffering.find_or_initialize_by(
        course: course,
        academic_year: required_value(row, "academic_year"),
        semester: required_value(row, "semester"),
        teacher_name: required_value(row, "teacher_name"),
        day_of_week: row["day_of_week"].presence,
        period: row["period"].presence
      )
      stats[:created] += 1 if offering.new_record?

      offering.assign_attributes(
        delivery_method: row["delivery_method"].presence || "in_person",
        target_grade: row["target_grade"].presence || "all_grades",
        campus: row["campus"],
        classroom: row["classroom"]
      )
      offering.save!
      stats[:processed] += 1
    rescue StandardError => e
      stats[:errors] += 1
      log("course_offerings.csv line #{line_number}: #{e.class} #{e.message}")
    end

    log("Course offerings import processed=#{stats[:processed]} created=#{stats[:created]} errors=#{stats[:errors]}")
  end

  def required_value(row, key)
    value = row[key].to_s.strip
    raise ArgumentError, "#{key} is required" if value.blank?

    value
  end

  def empty_stats
    { processed: 0, created: 0, errors: 0 }
  end

  def log(message)
    logger.info(message)
    puts message if Rails.env.development? || Rails.env.test?
  end
end
