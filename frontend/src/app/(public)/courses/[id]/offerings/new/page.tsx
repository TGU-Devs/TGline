"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Plus } from "lucide-react";

import LoginPromptModal from "@/components/features/auth/LoginPromptModal";
import {
  CAMPUS_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  DELIVERY_METHOD_OPTIONS,
  FACULTY_DEPARTMENT_OPTIONS,
  SEMESTER_OPTIONS,
  TARGET_GRADE_OPTIONS,
  departmentsForFaculty,
} from "@/components/features/courses/options";
import type { Course } from "@/components/features/courses/types";
import ErrorUI from "@/components/ui/ErrorUI";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import SelectField from "@/components/ui/form/SelectField";
import TextField from "@/components/ui/form/TextField";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { ApiError, apiFetch, apiJson } from "@/lib/api";

type OfferingForm = {
  teacher_name: string;
  academic_year: string;
  semester: string;
  day_of_week: string;
  delivery_method: string;
  faculty: string;
  department: string;
  target_grade: string;
  period: string;
  campus: string;
  classroom: string;
};

const initialOfferingForm: OfferingForm = {
  teacher_name: "",
  academic_year: "",
  semester: "other",
  day_of_week: "",
  delivery_method: "in_person",
  faculty: FACULTY_DEPARTMENT_OPTIONS[0].faculty,
  department: FACULTY_DEPARTMENT_OPTIONS[0].departments[0],
  target_grade: "all_grades",
  period: "",
  campus: CAMPUS_OPTIONS[0],
  classroom: "",
};

export default function NewCourseOfferingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const courseId = params.id;

  const [course, setCourse] = useState<Course | null>(null);
  const {
    isAuthenticated,
    showLoginModal,
    openLoginModal,
    closeLoginModal,
    requireAuth,
  } = useAuthGuard();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<OfferingForm>(initialOfferingForm);

  const fetchPageData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const courseRes = await apiFetch(`/api/courses/${courseId}`);

      if (!courseRes.ok) {
        throw new Error("授業情報の取得に失敗しました");
      }

      const courseData = (await courseRes.json()) as Course;
      setCourse(courseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleFacultyChange = (faculty: string) => {
    const departments = departmentsForFaculty(faculty);
    setForm((prev) => ({
      ...prev,
      faculty,
      department: departments[0] ?? "",
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requireAuth()) return;
    if (!course) return;

    try {
      setFormError(null);
      setIsSubmitting(true);
      const requiresDepartment = course.category !== "教養科目";

      await apiJson(
        `/api/courses/${courseId}/course_offerings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            course_offering: {
              teacher_name: form.teacher_name,
              academic_year: form.academic_year.trim() ? Number(form.academic_year) : null,
              semester: form.semester,
              day_of_week: form.day_of_week || null,
              delivery_method: form.delivery_method,
              target_grade: form.target_grade,
              faculty: requiresDepartment ? form.faculty : null,
              department: requiresDepartment ? form.department : null,
              period: form.period ? Number(form.period) : null,
              campus: form.campus,
              classroom: form.classroom,
            },
          }),
        },
        "開講情報の追加に失敗しました",
      );

      router.push(`/courses/${courseId}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        openLoginModal();
        return;
      }
      setFormError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !course) {
    return <ErrorUI error={error ?? "授業が見つかりません"} fetch={fetchPageData} />;
  }

  const requiresDepartment = course.category !== "教養科目";
  const departmentOptions = departmentsForFaculty(form.faculty);

  return (
    <main className="min-h-screen bg-background py-4 sm:py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href={`/courses/${course.id}`}
          className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowLeft className="size-4" />
          授業詳細へ戻る
        </Link>

        <section className="mb-5 rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <CalendarDays className="size-4" />
            開講情報を追加
          </p>
          <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">{course.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">年度・教員・時間割などの開講情報を登録します。</p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="教授名"
              value={form.teacher_name}
              onChange={(value) => setForm((prev) => ({ ...prev, teacher_name: value }))}
              required
              surface="card"
            />
            <TextField
              label="開講年度"
              value={form.academic_year}
              onChange={(value) => setForm((prev) => ({ ...prev, academic_year: value }))}
              inputMode="numeric"
              surface="card"
            />
            <SelectField
              label="学期"
              value={form.semester}
              onChange={(value) => setForm((prev) => ({ ...prev, semester: value }))}
              options={SEMESTER_OPTIONS.map((option) => option.value)}
              getLabel={(value) => SEMESTER_OPTIONS.find((option) => option.value === value)?.label ?? value}
              required
              surface="card"
            />
            <SelectField
              label="曜日"
              value={form.day_of_week}
              onChange={(value) => setForm((prev) => ({ ...prev, day_of_week: value }))}
              options={DAY_OF_WEEK_OPTIONS.map((option) => option.value)}
              getLabel={(value) => DAY_OF_WEEK_OPTIONS.find((option) => option.value === value)?.label ?? value}
              surface="card"
            />
            <SelectField
              label="授業形態"
              value={form.delivery_method}
              onChange={(value) => setForm((prev) => ({ ...prev, delivery_method: value }))}
              options={DELIVERY_METHOD_OPTIONS.map((option) => option.value)}
              getLabel={(value) => DELIVERY_METHOD_OPTIONS.find((option) => option.value === value)?.label ?? value}
              required
              surface="card"
            />
            <TextField
              label="時限"
              value={form.period}
              onChange={(value) => setForm((prev) => ({ ...prev, period: value }))}
              inputMode="numeric"
              surface="card"
            />
            {requiresDepartment ? (
              <>
                <SelectField
                  label="学部"
                  value={form.faculty}
                  onChange={handleFacultyChange}
                  options={FACULTY_DEPARTMENT_OPTIONS.map((option) => option.faculty)}
                  required
                  surface="card"
                />
                <SelectField
                  label="学科"
                  value={form.department}
                  onChange={(value) => setForm((prev) => ({ ...prev, department: value }))}
                  options={departmentOptions}
                  required
                  surface="card"
                />
              </>
            ) : null}
            <SelectField
              label="対象学年"
              value={form.target_grade}
              onChange={(value) => setForm((prev) => ({ ...prev, target_grade: value }))}
              options={TARGET_GRADE_OPTIONS.map((option) => option.value)}
              getLabel={(value) => TARGET_GRADE_OPTIONS.find((option) => option.value === value)?.label ?? value}
              required
              surface="card"
            />
            <SelectField
              label="キャンパス"
              value={form.campus}
              onChange={(value) => setForm((prev) => ({ ...prev, campus: value }))}
              options={[...CAMPUS_OPTIONS]}
              required
              surface="card"
            />
            <TextField
              label="教室"
              value={form.classroom}
              onChange={(value) => setForm((prev) => ({ ...prev, classroom: value }))}
              surface="card"
            />
          </div>

          {formError && <p className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">{formError}</p>}

          <Button
            type={isAuthenticated === false ? "button" : "submit"}
            disabled={isSubmitting || isAuthenticated === null}
            onClick={isAuthenticated === false ? openLoginModal : undefined}
            className="h-11 w-full rounded-md"
          >
            <Plus className="size-4" />
            {isSubmitting ? "追加中..." : "開講情報を追加"}
          </Button>
        </form>
      </div>

      <LoginPromptModal isOpen={showLoginModal} onClose={closeLoginModal} />
    </main>
  );
}
