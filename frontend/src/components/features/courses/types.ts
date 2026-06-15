export type CourseOffering = {
  id: number;
  academic_year: number;
  semester: string;
  teacher_name: string;
  day_of_week: string | null;
  delivery_method: string;
  target_grade: string;
  period: number | null;
  campus: string | null;
  classroom: string | null;
};

export type Course = {
  id: number;
  name: string;
  faculty: string;
  department: string | null;
  category: string | null;
  reviews_count: number;
  average_rating: number | null;
  average_difficulty: number | null;
  average_workload: number | null;
  average_attendance: number | null;
  average_grading: number | null;
  created_by_id: number | null;
  can_manage: boolean;
  primary_course_offering: CourseOffering | null;
  course_offerings?: CourseOffering[];
  created_at: string;
  updated_at: string;
};

export type CourseReview = {
  id: number;
  course_id: number;
  course_offering_id: number | null;
  user: {
    id: number;
    display_name: string;
  };
  rating: number;
  difficulty: number;
  workload: number;
  attendance: number;
  grading: number;
  exam_presence: string;
  attendance_check: string;
  textbook_required: boolean;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type CoursesResponse = {
  courses: Course[];
  has_next: boolean;
};

export type CourseReviewsResponse = {
  course_reviews: CourseReview[];
};
