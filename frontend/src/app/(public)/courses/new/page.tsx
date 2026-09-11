"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Building2, MapPin, Plus } from "lucide-react";

import LoginPromptModal from "@/components/features/auth/LoginPromptModal";
import {
  CAMPUS_OPTIONS,
  COURSE_CATEGORY_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  DELIVERY_METHOD_OPTIONS,
  FACULTY_DEPARTMENT_OPTIONS,
  SEMESTER_OPTIONS,
  TARGET_GRADE_OPTIONS,
  departmentsForFaculty,
} from "@/components/features/courses/options";
import { Button } from "@/components/ui/button";
import SelectField from "@/components/ui/form/SelectField";
import TextField from "@/components/ui/form/TextField";

import type { Course } from "@/components/features/courses/types";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { ApiError, apiJson } from "@/lib/api";

type CourseForm = {
  name: string;
  teacher_name: string;
  faculty: string;
  department: string;
  academic_year: string;
  category: string;
  semester: string;
  day_of_week: string;
  delivery_method: string;
  period: string;
  target_grade: string;
  campus: string;
  classroom: string;
};

const initialCourseForm: CourseForm = {
  name: "",
  teacher_name: "",
  faculty: FACULTY_DEPARTMENT_OPTIONS[0].faculty,
  department: FACULTY_DEPARTMENT_OPTIONS[0].departments[0],
  academic_year: "",
  category: COURSE_CATEGORY_OPTIONS[0],
  semester: "other",
  day_of_week: "",
  delivery_method: "in_person",
  period: "",
  target_grade: "all_grades",
  campus: CAMPUS_OPTIONS[0],
  classroom: "",
};

export default function NewCoursePage() {
  const router = useRouter();

  const {
    isAuthenticated,
    showLoginModal,
    closeLoginModal,
    requireAuth,
    markUnauthenticated,
  } = useAuthGuard();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<CourseForm>(initialCourseForm);
  const departmentOptions = departmentsForFaculty(courseForm.faculty);
  const requiresDepartment = courseForm.category !== "教養科目";

  const handleFacultyChange = (faculty: string) => {
    const departments = departmentsForFaculty(faculty);
    setCourseForm((prev) => ({
      ...prev,
      faculty,
      department: departments[0] ?? "",
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requireAuth()) return;

    try {
      setError(null);
      setIsCreating(true);

      const created = await apiJson<Course>(
        "/api/courses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            course: {
              name: courseForm.name,
              category: courseForm.category,
            },
            course_offering: {
              teacher_name: courseForm.teacher_name,
              academic_year: courseForm.academic_year.trim() ? Number(courseForm.academic_year) : null,
              semester: courseForm.semester,
              day_of_week: courseForm.day_of_week || null,
              delivery_method: courseForm.delivery_method,
              period: courseForm.period ? Number(courseForm.period) : null,
              target_grade: courseForm.target_grade,
              faculty: requiresDepartment ? courseForm.faculty : null,
              department: requiresDepartment ? courseForm.department : null,
              campus: courseForm.campus,
              classroom: courseForm.classroom,
            },
          }),
        },
        "授業の作成に失敗しました",
      );

      router.push(`/courses/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        markUnauthenticated();
        return;
      }
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-4 sm:py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href="/courses"
          className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowLeft className="size-4" />
          授業一覧へ戻る
        </Link>

        <div className="mb-5">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <BookOpen className="size-4" />
            授業追加
          </p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">授業情報を登録</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            登録した授業に対して、レビューは詳細ページから別で投稿できます。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900">基本情報</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="授業名" value={courseForm.name} onChange={(value) => setCourseForm((prev) => ({ ...prev, name: value }))} required />
            <SelectField label="カテゴリ" value={courseForm.category} onChange={(value) => setCourseForm((prev) => ({ ...prev, category: value }))} options={[...COURSE_CATEGORY_OPTIONS]} required />
            {requiresDepartment ? (
              <>
                <SelectField label="学部" value={courseForm.faculty} onChange={handleFacultyChange} options={FACULTY_DEPARTMENT_OPTIONS.map((option) => option.faculty)} required />
                <SelectField label="学科" value={courseForm.department} onChange={(value) => setCourseForm((prev) => ({ ...prev, department: value }))} options={departmentOptions} required />
              </>
            ) : null}
            <TextField label="教授名" value={courseForm.teacher_name} onChange={(value) => setCourseForm((prev) => ({ ...prev, teacher_name: value }))} required />
            <TextField label="開講年度" value={courseForm.academic_year} onChange={(value) => setCourseForm((prev) => ({ ...prev, academic_year: value }))} inputMode="numeric" />
            <SelectField label="学期" value={courseForm.semester} onChange={(value) => setCourseForm((prev) => ({ ...prev, semester: value }))} options={SEMESTER_OPTIONS.map((option) => option.value)} getLabel={(value) => SEMESTER_OPTIONS.find((option) => option.value === value)?.label ?? value} />
            <SelectField label="曜日" value={courseForm.day_of_week} onChange={(value) => setCourseForm((prev) => ({ ...prev, day_of_week: value }))} options={DAY_OF_WEEK_OPTIONS.map((option) => option.value)} getLabel={(value) => DAY_OF_WEEK_OPTIONS.find((option) => option.value === value)?.label ?? value} />
            <SelectField label="授業形態" value={courseForm.delivery_method} onChange={(value) => setCourseForm((prev) => ({ ...prev, delivery_method: value }))} options={DELIVERY_METHOD_OPTIONS.map((option) => option.value)} getLabel={(value) => DELIVERY_METHOD_OPTIONS.find((option) => option.value === value)?.label ?? value} required />
            <TextField label="時限" value={courseForm.period} onChange={(value) => setCourseForm((prev) => ({ ...prev, period: value }))} inputMode="numeric" />
            <SelectField label="対象学年" value={courseForm.target_grade} onChange={(value) => setCourseForm((prev) => ({ ...prev, target_grade: value }))} options={TARGET_GRADE_OPTIONS.map((option) => option.value)} getLabel={(value) => TARGET_GRADE_OPTIONS.find((option) => option.value === value)?.label ?? value} required />
          </div>

          <div className="my-6 h-px bg-border" />

          <div className="mb-5 flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900">教室情報</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="キャンパス" value={courseForm.campus} onChange={(value) => setCourseForm((prev) => ({ ...prev, campus: value }))} options={[...CAMPUS_OPTIONS]} required />
            <TextField label="教室" value={courseForm.classroom} onChange={(value) => setCourseForm((prev) => ({ ...prev, classroom: value }))} />
          </div>

          {error && <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>}

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isCreating || isAuthenticated === null} className="h-11 rounded-md">
              <Plus className="size-4" />
              {isCreating ? "作成中..." : "授業を作成"}
            </Button>
          </div>
        </form>
      </div>

      <LoginPromptModal isOpen={showLoginModal} onClose={closeLoginModal} />
    </main>
  );
}

