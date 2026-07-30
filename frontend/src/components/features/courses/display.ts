import {
  formatDayOfWeek,
  formatDeliveryMethod,
  formatSemester,
  formatTargetGrade,
} from "@/components/features/courses/labels";

import type { CourseOffering, CourseReview } from "@/components/features/courses/types";

export type ReviewScoreField = "rating" | "difficulty" | "workload" | "grading";

export function courseOfferingBadges(offering: CourseOffering) {
  const labels = [
    offering.department ? `${offering.faculty}・${offering.department}` : offering.faculty ?? "",
    visibleLabel(formatTargetGrade(offering.target_grade)),
    visibleLabel(formatDeliveryMethod(offering.delivery_method)),
  ].filter(Boolean);
  const semester = formatOptionalSemester(offering.semester);
  const schedule = formatSchedule(offering);

  if (semester) labels.push(semester);
  if (schedule) labels.push(schedule);
  if (offering.academic_year) labels.push(`${offering.academic_year}年度`);

  return labels;
}

export function formatCourseOfferingOption(offering: CourseOffering) {
  return [offering.teacher_name, ...courseOfferingBadges(offering)].filter(Boolean).join(" ");
}

export function reviewStats(reviews: CourseReview[]) {
  return {
    reviews_count: reviews.length,
    average_rating: averageReviewScore(reviews, "rating"),
    average_difficulty: averageReviewScore(reviews, "difficulty"),
    average_workload: averageReviewScore(reviews, "workload"),
    average_grading: averageReviewScore(reviews, "grading"),
  };
}

function averageReviewScore(reviews: CourseReview[], field: ReviewScoreField) {
  if (reviews.length === 0) return null;

  const total = reviews.reduce((sum, review) => sum + review[field], 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

function formatOptionalSemester(value: string | null | undefined) {
  if (!value || value === "other") return "";

  return formatSemester(value);
}

function formatSchedule(offering: CourseOffering) {
  const day = offering.day_of_week && offering.day_of_week !== "other_day" ? formatDayOfWeek(offering.day_of_week) : "";
  const period = offering.period ? `${offering.period}限` : "";

  return `${day}${period}`;
}

function visibleLabel(value: string) {
  return value === "-" ? "" : value;
}
