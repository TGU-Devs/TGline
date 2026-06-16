"use client";

import { useEffect, useMemo, useState } from "react";
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

import type { Course } from "@/components/features/courses/types";

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
  target_grade: "all_grades",
  campus: CAMPUS_OPTIONS[0],
  classroom: "",
};

export default function NewCoursePage() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<CourseForm>(initialCourseForm);

  const departmentOptions = useMemo(() => departmentsForFaculty(courseForm.faculty), [courseForm.faculty]);

  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => {
        setIsAuthenticated(res.ok);
        if (!res.ok) setShowLoginModal(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setShowLoginModal(true);
      });
  }, []);

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

    if (isAuthenticated === false) {
      setShowLoginModal(true);
      return;
    }

    if (isAuthenticated === null) return;

    try {
      setError(null);
      setIsCreating(true);

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          course: {
            name: courseForm.name,
            faculty: courseForm.faculty,
            department: courseForm.department,
            category: courseForm.category,
          },
          course_offering: {
            teacher_name: courseForm.teacher_name,
            academic_year: courseForm.academic_year.trim() ? Number(courseForm.academic_year) : null,
            semester: courseForm.semester,
            day_of_week: courseForm.day_of_week || null,
            delivery_method: courseForm.delivery_method,
            target_grade: courseForm.target_grade,
            campus: courseForm.campus,
            classroom: courseForm.classroom,
          },
        }),
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setShowLoginModal(true);
        return;
      }

      if (!res.ok) {
        throw new Error("授業の作成に失敗しました");
      }

      const created = (await res.json()) as Course;
      router.push(`/courses/${created.id}`);
    } catch (err) {
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
            <TextInput label="授業名" value={courseForm.name} onChange={(value) => setCourseForm((prev) => ({ ...prev, name: value }))} required />
            <TextInput label="教授名" value={courseForm.teacher_name} onChange={(value) => setCourseForm((prev) => ({ ...prev, teacher_name: value }))} required />

            <SelectInput label="学部" value={courseForm.faculty} onChange={handleFacultyChange} options={FACULTY_DEPARTMENT_OPTIONS.map((option) => option.faculty)} required />
            <SelectInput label="学科" value={courseForm.department} onChange={(value) => setCourseForm((prev) => ({ ...prev, department: value }))} options={departmentOptions} required />

            <TextInput label="受講年度" value={courseForm.academic_year} onChange={(value) => setCourseForm((prev) => ({ ...prev, academic_year: value }))} inputMode="numeric" />
            <SelectInput label="カテゴリ" value={courseForm.category} onChange={(value) => setCourseForm((prev) => ({ ...prev, category: value }))} options={[...COURSE_CATEGORY_OPTIONS]} required />
            <SelectInput label="学期" value={courseForm.semester} onChange={(value) => setCourseForm((prev) => ({ ...prev, semester: value }))} options={SEMESTER_OPTIONS.map((option) => option.value)} getLabel={(value) => SEMESTER_OPTIONS.find((option) => option.value === value)?.label ?? value} />
            <SelectInput label="曜日" value={courseForm.day_of_week} onChange={(value) => setCourseForm((prev) => ({ ...prev, day_of_week: value }))} options={DAY_OF_WEEK_OPTIONS.map((option) => option.value)} getLabel={(value) => DAY_OF_WEEK_OPTIONS.find((option) => option.value === value)?.label ?? value} />
            <SelectInput label="授業形態" value={courseForm.delivery_method} onChange={(value) => setCourseForm((prev) => ({ ...prev, delivery_method: value }))} options={DELIVERY_METHOD_OPTIONS.map((option) => option.value)} getLabel={(value) => DELIVERY_METHOD_OPTIONS.find((option) => option.value === value)?.label ?? value} required />
            <SelectInput label="対象学年" value={courseForm.target_grade} onChange={(value) => setCourseForm((prev) => ({ ...prev, target_grade: value }))} options={TARGET_GRADE_OPTIONS.map((option) => option.value)} getLabel={(value) => TARGET_GRADE_OPTIONS.find((option) => option.value === value)?.label ?? value} required />
          </div>

          <div className="my-6 h-px bg-border" />

          <div className="mb-5 flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900">教室情報</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectInput label="キャンパス" value={courseForm.campus} onChange={(value) => setCourseForm((prev) => ({ ...prev, campus: value }))} options={[...CAMPUS_OPTIONS]} required />
            <TextInput label="教室" value={courseForm.classroom} onChange={(value) => setCourseForm((prev) => ({ ...prev, classroom: value }))} />
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

      <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  );
}

function TextInput({
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
        className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function SelectInput({
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
        className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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

function FieldLabel({ label, required }: { label: string; required: boolean }) {
  return (
    <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
      {label}
      <span
        className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
          required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {required ? "必須" : "任意"}
      </span>
    </span>
  );
}
