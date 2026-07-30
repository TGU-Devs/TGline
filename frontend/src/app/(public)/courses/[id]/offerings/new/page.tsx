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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<OfferingForm>(initialOfferingForm);

  const fetchPageData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const [courseRes, meRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`, { credentials: "include" }),
        fetch("/api/users/me", { credentials: "include" }),
      ]);

      if (!courseRes.ok) {
        throw new Error("授業情報の取得に失敗しました");
      }

      const courseData = (await courseRes.json()) as Course;
      setCourse(courseData);
      setIsAuthenticated(meRes.ok);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  useEffect(() => {
    if (isAuthenticated === false) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

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

    if (isAuthenticated === false) {
      setShowLoginModal(true);
      return;
    }

    if (isAuthenticated === null) return;
    if (!course) return;

    try {
      setFormError(null);
      setIsSubmitting(true);
      const requiresDepartment = course.category !== "教養科目";

      const res = await fetch(`/api/courses/${courseId}/course_offerings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setShowLoginModal(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || data?.errors?.join?.(" / ") || "開講情報の追加に失敗しました");
      }

      router.push(`/courses/${courseId}`);
    } catch (err) {
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
            <OfferingInput
              label="教授名"
              value={form.teacher_name}
              onChange={(value) => setForm((prev) => ({ ...prev, teacher_name: value }))}
              required
            />
            <OfferingInput
              label="開講年度"
              value={form.academic_year}
              onChange={(value) => setForm((prev) => ({ ...prev, academic_year: value }))}
              inputMode="numeric"
            />
            <OfferingSelect
              label="学期"
              value={form.semester}
              onChange={(value) => setForm((prev) => ({ ...prev, semester: value }))}
              options={SEMESTER_OPTIONS.map((option) => option.value)}
              getLabel={(value) => SEMESTER_OPTIONS.find((option) => option.value === value)?.label ?? value}
              required
            />
            <OfferingSelect
              label="曜日"
              value={form.day_of_week}
              onChange={(value) => setForm((prev) => ({ ...prev, day_of_week: value }))}
              options={DAY_OF_WEEK_OPTIONS.map((option) => option.value)}
              getLabel={(value) => DAY_OF_WEEK_OPTIONS.find((option) => option.value === value)?.label ?? value}
            />
            <OfferingSelect
              label="授業形態"
              value={form.delivery_method}
              onChange={(value) => setForm((prev) => ({ ...prev, delivery_method: value }))}
              options={DELIVERY_METHOD_OPTIONS.map((option) => option.value)}
              getLabel={(value) => DELIVERY_METHOD_OPTIONS.find((option) => option.value === value)?.label ?? value}
              required
            />
            <OfferingInput
              label="時限"
              value={form.period}
              onChange={(value) => setForm((prev) => ({ ...prev, period: value }))}
              inputMode="numeric"
            />
            {requiresDepartment ? (
              <>
                <OfferingSelect
                  label="学部"
                  value={form.faculty}
                  onChange={handleFacultyChange}
                  options={FACULTY_DEPARTMENT_OPTIONS.map((option) => option.faculty)}
                  required
                />
                <OfferingSelect
                  label="学科"
                  value={form.department}
                  onChange={(value) => setForm((prev) => ({ ...prev, department: value }))}
                  options={departmentOptions}
                  required
                />
              </>
            ) : null}
            <OfferingSelect
              label="対象学年"
              value={form.target_grade}
              onChange={(value) => setForm((prev) => ({ ...prev, target_grade: value }))}
              options={TARGET_GRADE_OPTIONS.map((option) => option.value)}
              getLabel={(value) => TARGET_GRADE_OPTIONS.find((option) => option.value === value)?.label ?? value}
              required
            />
            <OfferingSelect
              label="キャンパス"
              value={form.campus}
              onChange={(value) => setForm((prev) => ({ ...prev, campus: value }))}
              options={[...CAMPUS_OPTIONS]}
              required
            />
            <OfferingInput
              label="教室"
              value={form.classroom}
              onChange={(value) => setForm((prev) => ({ ...prev, classroom: value }))}
            />
          </div>

          {formError && <p className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">{formError}</p>}

          <Button
            type={isAuthenticated === false ? "button" : "submit"}
            disabled={isSubmitting || isAuthenticated === null}
            onClick={isAuthenticated === false ? () => setShowLoginModal(true) : undefined}
            className="h-11 w-full rounded-md"
          >
            <Plus className="size-4" />
            {isSubmitting ? "追加中..." : "開講情報を追加"}
          </Button>
        </form>
      </div>

      <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  );
}

function FieldLabel({ label, required }: { label: string; required: boolean }) {
  return (
    <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
      {label}
      <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
        {required ? "必須" : "任意"}
      </span>
    </span>
  );
}

function OfferingInput({
  label,
  value,
  onChange,
  required = false,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "numeric";
}) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        inputMode={inputMode}
        className="h-11 w-full rounded-md border border-input bg-card px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function OfferingSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  getLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
  getLabel?: (value: string) => string;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="h-11 w-full rounded-md border border-input bg-card px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel ? getLabel(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
}
