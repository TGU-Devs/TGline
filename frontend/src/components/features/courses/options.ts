export const FACULTY_DEPARTMENT_OPTIONS = [
  {
    faculty: "文学部",
    departments: ["英文学科", "総合人文学科", "歴史学科", "教育学科"],
  },
  {
    faculty: "経済学部",
    departments: ["経済学科", "共生社会経済学科"],
  },
  {
    faculty: "経営学部",
    departments: ["経営学科"],
  },
  {
    faculty: "法学部",
    departments: ["法律学科"],
  },
  {
    faculty: "工学部",
    departments: ["機械知能工学科", "電気電子工学科", "環境建設工学科"],
  },
  {
    faculty: "情報学部",
    departments: ["データサイエンス学科"],
  },
  {
    faculty: "地域総合学部",
    departments: ["地域コミュニティ学科", "政策デザイン学科"],
  },
  {
    faculty: "人間科学部",
    departments: ["心理行動科学科"],
  },
  {
    faculty: "国際学部",
    departments: ["国際教養学科"],
  },
] as const;

export const CAMPUS_OPTIONS = ["五橋キャンパス", "土樋キャンパス", "泉キャンパス"] as const;

export const COURSE_CATEGORY_OPTIONS = ["教養科目", "専門科目", "外国語科目", "教職科目"] as const;

export const SEMESTER_OPTIONS = [
  { value: "other", label: "未指定" },
  { value: "first", label: "前期" },
  { value: "second", label: "後期" },
  { value: "full_year", label: "通年" },
  { value: "intensive", label: "集中" },
] as const;

export const DAY_OF_WEEK_OPTIONS = [
  { value: "", label: "未指定" },
  { value: "monday", label: "月曜" },
  { value: "tuesday", label: "火曜" },
  { value: "wednesday", label: "水曜" },
  { value: "thursday", label: "木曜" },
  { value: "friday", label: "金曜" },
  { value: "saturday", label: "土曜" },
  { value: "sunday", label: "日曜" },
  { value: "other_day", label: "その他" },
] as const;

export const DELIVERY_METHOD_OPTIONS = [
  { value: "in_person", label: "対面授業" },
  { value: "remote", label: "オンデマンド・リモート" },
] as const;

export const TARGET_GRADE_OPTIONS = [
  { value: "all_grades", label: "全学年" },
  { value: "first_year", label: "1年" },
  { value: "second_year", label: "2年" },
  { value: "third_year", label: "3年" },
  { value: "fourth_year", label: "4年" },
] as const;

export const PRESENCE_OPTIONS = [
  { value: "none", label: "なし" },
  { value: "sometimes", label: "ときどきあり" },
  { value: "yes", label: "あり" },
] as const;

export const TEXTBOOK_REQUIRED_OPTIONS = [
  { value: "false", label: "不要" },
  { value: "true", label: "必要" },
] as const;

export function departmentsForFaculty(faculty: string) {
  return FACULTY_DEPARTMENT_OPTIONS.find((option) => option.faculty === faculty)?.departments ?? [];
}
