export const semesterLabels: Record<string, string> = {
  first: "前期",
  second: "後期",
  full_year: "通年",
  intensive: "集中",
  other: "その他",
};

export const dayOfWeekLabels: Record<string, string> = {
  monday: "月曜",
  tuesday: "火曜",
  wednesday: "水曜",
  thursday: "木曜",
  friday: "金曜",
  saturday: "土曜",
  sunday: "日曜",
  other_day: "その他",
};

export const deliveryMethodLabels: Record<string, string> = {
  in_person: "対面授業",
  remote: "オンデマンド・リモート",
};

export const targetGradeLabels: Record<string, string> = {
  all_grades: "全学年",
  first_year: "1年",
  second_year: "2年",
  third_year: "3年",
  fourth_year: "4年",
};

export const presenceLabels: Record<string, string> = {
  none: "なし",
  sometimes: "ときどきあり",
  yes: "あり",
};

export const ratingLabels = {
  rating: "総合評価",
  difficulty: "難易度",
  workload: "課題量",
  attendance: "出席",
  grading: "単位の取りやすさ",
} as const;

export function formatSemester(value: string | null | undefined) {
  if (!value) return "-";
  return semesterLabels[value] ?? value;
}

export function formatDayOfWeek(value: string | null | undefined) {
  if (!value) return "-";
  return dayOfWeekLabels[value] ?? value;
}

export function formatDeliveryMethod(value: string | null | undefined) {
  if (!value) return "-";
  return deliveryMethodLabels[value] ?? value;
}

export function formatTargetGrade(value: string | null | undefined) {
  if (!value) return "-";
  return targetGradeLabels[value] ?? value;
}

export function formatPresence(value: string | null | undefined) {
  if (!value) return "-";
  return presenceLabels[value] ?? value;
}

export function formatAverage(value: number | null | undefined) {
  return typeof value === "number" ? value.toFixed(1) : "-";
}
