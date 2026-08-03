"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Star } from "lucide-react";

import LoginPromptModal from "@/components/features/auth/LoginPromptModal";
import { formatCourseOfferingOption } from "@/components/features/courses/display";
import { ratingLabels, ratingScaleHints } from "@/components/features/courses/labels";
import {
  PRESENCE_OPTIONS,
  TEXTBOOK_REQUIRED_OPTIONS,
} from "@/components/features/courses/options";
import type { Course } from "@/components/features/courses/types";
import ErrorUI from "@/components/ui/ErrorUI";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";

const scoreFields = ["rating", "difficulty", "workload", "grading"] as const;

type ScoreField = (typeof scoreFields)[number];

type ReviewForm = Record<ScoreField, number> & {
  exam_presence: string;
  attendance_check: string;
  textbook_required: string;
  comment: string;
};

const initialForm: ReviewForm = {
  rating: 5,
  difficulty: 3,
  workload: 3,
  grading: 3,
  exam_presence: "none",
  attendance_check: "none",
  textbook_required: "false",
  comment: "",
};

export default function NewOfferingReviewPage() {
  const params = useParams<{ id: string; offeringId: string }>();
  const router = useRouter();
  const courseId = params.id;
  const offeringId = Number(params.offeringId);

  const [course, setCourse] = useState<Course | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewForm>(initialForm);

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

      if (!meRes.ok) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, offeringId]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  useEffect(() => {
    if (isAuthenticated === false) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  const offering = useMemo(() => {
    return course?.course_offerings?.find((item) => item.id === offeringId);
  }, [course, offeringId]);

  const handleScoreChange = (field: ScoreField, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isAuthenticated === false) {
      setShowLoginModal(true);
      return;
    }

    if (isAuthenticated === null) return;

    try {
      setFormError(null);
      setIsSubmitting(true);

      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          course_review: {
            course_offering_id: offeringId,
            rating: form.rating,
            difficulty: form.difficulty,
            workload: form.workload,
            grading: form.grading,
            exam_presence: form.exam_presence,
            attendance_check: form.attendance_check,
            textbook_required: form.textbook_required === "true",
            comment: form.comment,
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
        throw new Error(data?.error || "レビュー投稿に失敗しました");
      }

      router.push(`/courses/${courseId}/offerings/${offeringId}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !course || !offering) {
    return <ErrorUI error={error ?? "開講情報が見つかりません"} fetch={fetchPageData} />;
  }

  return (
    <main className="min-h-screen bg-background py-4 sm:py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href={`/courses/${course.id}/offerings/${offering.id}`}
          className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowLeft className="size-4" />
          開講詳細へ戻る
        </Link>

        <section className="mb-5 rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Edit3 className="size-4" />
            口コミ投稿
          </p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{course.name}</h1>
          <p className="mt-2 text-sm font-semibold text-primary">{formatCourseOfferingOption(offering)}</p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
          {scoreFields.map((field) => (
            <ScoreInput
              key={field}
              label={ratingLabels[field]}
              minLabel={ratingScaleHints[field].min}
              maxLabel={ratingScaleHints[field].max}
              value={form[field]}
              onChange={(value) => handleScoreChange(field, value)}
            />
          ))}

          <OptionGroup
            label="テスト"
            value={form.exam_presence}
            options={PRESENCE_OPTIONS}
            onChange={(value) => setForm((prev) => ({ ...prev, exam_presence: value }))}
          />

          <OptionGroup
            label="出席確認"
            value={form.attendance_check}
            options={PRESENCE_OPTIONS}
            onChange={(value) => setForm((prev) => ({ ...prev, attendance_check: value }))}
          />

          <OptionGroup
            label="教科書"
            value={form.textbook_required}
            options={TEXTBOOK_REQUIRED_OPTIONS}
            onChange={(value) => setForm((prev) => ({ ...prev, textbook_required: value }))}
          />

          <label className="block">
            <FieldLabel label="コメント" required={false} />
            <textarea
              value={form.comment}
              onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
              className="min-h-32 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-base leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              maxLength={5000}
              placeholder="授業の雰囲気、課題、テスト、履修判断に役立つ情報"
            />
          </label>

          {formError && <p className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">{formError}</p>}

          <Button
            type={isAuthenticated === false ? "button" : "submit"}
            disabled={isSubmitting || isAuthenticated === null}
            onClick={isAuthenticated === false ? () => setShowLoginModal(true) : undefined}
            className="h-11 w-full rounded-md"
          >
            <Star className="size-4" />
            {isSubmitting ? "投稿中..." : "口コミを投稿"}
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

function ScoreInput({
  label,
  minLabel,
  maxLabel,
  value,
  onChange,
}: {
  label: string;
  minLabel: string;
  maxLabel: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="mb-4 flex items-center justify-between">
        <FieldLabel label={label} required />
        <span className="text-3xl font-bold leading-none text-primary">{value}</span>
      </div>
      <div className="px-1">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary outline-none"
          aria-label={label}
          aria-valuetext={`${value}、${value === 1 ? minLabel : value === 5 ? maxLabel : "中間"}`}
        />
        <div className="mt-2 grid grid-cols-5 text-center text-xs font-medium text-muted-foreground">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`min-h-8 rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                value === score ? "font-bold text-primary" : "hover:text-slate-900"
              }`}
            >
              {score}
            </button>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-5 text-center text-[11px] font-semibold text-muted-foreground">
          <span>{minLabel}</span>
          <span />
          <span />
          <span />
          <span>{maxLabel}</span>
        </div>
      </div>
    </div>
  );
}

function OptionGroup({
  label,
  value,
  options,
  onChange,
  required = true,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} />
      <div className="grid gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              value === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-slate-700 hover:border-primary/50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
