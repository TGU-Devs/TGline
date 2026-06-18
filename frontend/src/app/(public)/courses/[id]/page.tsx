"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, ChevronDown, Cloud, ExternalLink, GraduationCap, MessageSquare, Plus, Star, Trash2 } from "lucide-react";

import Loading from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/ErrorUI";
import { Button } from "@/components/ui/button";
import LoginPromptModal from "@/components/features/auth/LoginPromptModal";
import {
  formatAverage,
  formatDayOfWeek,
  formatDeliveryMethod,
  formatPresence,
  formatSemester,
  formatTargetGrade,
  ratingLabels,
  ratingScaleHints,
} from "@/components/features/courses/labels";
import {
  CAMPUS_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  DELIVERY_METHOD_OPTIONS,
  PRESENCE_OPTIONS,
  SEMESTER_OPTIONS,
  TARGET_GRADE_OPTIONS,
  TEXTBOOK_REQUIRED_OPTIONS,
} from "@/components/features/courses/options";

import type { Course, CourseOffering, CourseReview, CourseReviewsResponse } from "@/components/features/courses/types";

const scoreFields = ["rating", "difficulty", "workload", "grading"] as const;
const COURSE_REQUEST_FORM_URL = "https://forms.gle/9UmZSNiZZWhZxE4JA";

type ScoreField = (typeof scoreFields)[number];

type ReviewForm = Record<ScoreField, number> & {
  course_offering_id: string;
  exam_presence: string;
  attendance_check: string;
  textbook_required: string;
  comment: string;
};

type OfferingForm = {
  teacher_name: string;
  academic_year: string;
  semester: string;
  day_of_week: string;
  delivery_method: string;
  target_grade: string;
  period: string;
  campus: string;
  classroom: string;
};

const initialForm: ReviewForm = {
  course_offering_id: "",
  rating: 5,
  difficulty: 3,
  workload: 3,
  grading: 3,
  exam_presence: "none",
  attendance_check: "none",
  textbook_required: "false",
  comment: "",
};

const initialOfferingForm: OfferingForm = {
  teacher_name: "",
  academic_year: "",
  semester: "other",
  day_of_week: "",
  delivery_method: "in_person",
  target_grade: "all_grades",
  period: "",
  campus: CAMPUS_OPTIONS[0],
  classroom: "",
};

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingOffering, setIsAddingOffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [offeringError, setOfferingError] = useState<string | null>(null);
  const [isOfferingFormOpen, setIsOfferingFormOpen] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [form, setForm] = useState<ReviewForm>(initialForm);
  const [offeringForm, setOfferingForm] = useState<OfferingForm>(initialOfferingForm);

  const fetchCourseDetail = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const [courseRes, reviewsRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`, { credentials: "include" }),
        fetch(`/api/courses/${courseId}/reviews`, { credentials: "include" }),
      ]);

      if (!courseRes.ok) {
        throw new Error("授業情報の取得に失敗しました");
      }

      if (!reviewsRes.ok) {
        throw new Error("レビューの取得に失敗しました");
      }

      const courseData = (await courseRes.json()) as Course;
      const reviewsData = (await reviewsRes.json()) as CourseReviewsResponse;
      setCourse(courseData);
      setReviews(reviewsData.course_reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetail();
    fetch("/api/users/me", { credentials: "include" })
      .then(async (res) => {
        setIsAuthenticated(res.ok);
        if (!res.ok) {
          setCurrentUserId(null);
          return;
        }
        const user = await res.json();
        setCurrentUserId(user.id);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setCurrentUserId(null);
      });
  }, [fetchCourseDetail]);

  const currentUserReview = useMemo(() => {
    if (!currentUserId) return undefined;
    return reviews.find((review) => review.user.id === currentUserId);
  }, [currentUserId, reviews]);

  const handleScoreChange = (field: ScoreField, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isAuthenticated === false) {
      setShowLoginModal(true);
      return;
    }

    if (isAuthenticated === null) {
      return;
    }

    try {
      setFormError(null);
      setIsSubmitting(true);

      const payload = {
        course_review: {
          course_offering_id: form.course_offering_id ? Number(form.course_offering_id) : null,
          rating: form.rating,
          difficulty: form.difficulty,
          workload: form.workload,
          grading: form.grading,
          exam_presence: form.exam_presence,
          attendance_check: form.attendance_check,
          textbook_required: form.textbook_required === "true",
          comment: form.comment,
        },
      };

      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setShowLoginModal(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 422) {
          throw new Error("この授業にはすでにレビュー済みです。");
        }
        throw new Error(data?.error || "レビュー投稿に失敗しました");
      }

      setForm(initialForm);
      await fetchCourseDetail();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!currentUserReview) return;
    if (!window.confirm("レビューを削除しますか？")) return;

    try {
      setFormError(null);
      setIsDeleting(true);

      const res = await fetch(`/api/course_reviews/${currentUserReview.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok && res.status !== 204) {
        throw new Error("レビュー削除に失敗しました");
      }

      await fetchCourseDetail();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddOffering = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isAuthenticated === false) {
      setShowLoginModal(true);
      return;
    }

    if (isAuthenticated === null) return;

    try {
      setOfferingError(null);
      setIsAddingOffering(true);

      const res = await fetch(`/api/courses/${courseId}/course_offerings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          course_offering: {
            teacher_name: offeringForm.teacher_name,
            academic_year: offeringForm.academic_year.trim() ? Number(offeringForm.academic_year) : null,
            semester: offeringForm.semester,
            day_of_week: offeringForm.day_of_week || null,
            delivery_method: offeringForm.delivery_method,
            target_grade: offeringForm.target_grade,
            period: offeringForm.period ? Number(offeringForm.period) : null,
            campus: offeringForm.campus,
            classroom: offeringForm.classroom,
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
        throw new Error(data?.error || "開講情報の追加に失敗しました");
      }

      setOfferingForm(initialOfferingForm);
      await fetchCourseDetail();
    } catch (err) {
      setOfferingError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsAddingOffering(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !course) {
    return <ErrorUI error={error ?? "授業が見つかりません"} fetch={fetchCourseDetail} />;
  }

  const offerings = course.course_offerings ?? [];

  return (
    <main className="min-h-screen bg-background py-4 sm:py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Link
          href="/courses"
          className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowLeft className="size-4" />
          授業一覧へ戻る
        </Link>
        <section className="mb-5 flex justify-end">
          <a
            href={COURSE_REQUEST_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-sm items-center gap-3 rounded-[2rem] border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-slate-700 shadow-sm transition hover:border-primary/40 hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Cloud className="size-6 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block font-semibold text-slate-900">授業情報の修正・削除依頼</span>
              <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                フォームから運営へ連絡
                <ExternalLink className="size-3" />
              </span>
            </span>
          </a>
        </section>

        <section className="mb-5 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {course.faculty}
                </span>
                {course.department && (
                  <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                    {course.department}
                  </span>
                )}
                {course.category && (
                  <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {course.category}
                  </span>
                )}
              </div>
              <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">{course.name}</h1>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:min-w-[300px]">
              <Metric label="平均評価" value={formatAverage(course.average_rating)} icon={<Star className="size-4 fill-amber-400 text-amber-400" />} />
              <Metric label="レビュー" value={String(course.reviews_count)} icon={<MessageSquare className="size-4 text-primary" />} />
              <Metric label="開講数" value={String(offerings.length)} icon={<CalendarDays className="size-4 text-primary" />} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ScoreSummary label={ratingLabels.difficulty} value={course.average_difficulty} />
            <ScoreSummary label={ratingLabels.workload} value={course.average_workload} />
            <ScoreSummary label={ratingLabels.grading} value={course.average_grading} />
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-5 text-primary" />
                  <h2 className="text-lg font-bold text-slate-900">開講情報</h2>
                </div>
              </div>

              {offerings.length === 0 ? (
                <p className="text-sm text-muted-foreground">開講情報はまだ登録されていません。</p>
              ) : (
                <div className="space-y-3">
                  {offerings.map((offering) => (
                    <div key={offering.id} className="rounded-md border border-border bg-background p-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                        {courseOfferingBadges(offering).map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>
                      <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                        <p>担当: {offering.teacher_name}</p>
                        <p>キャンパス: {offering.campus || "-"}</p>
                        {offering.classroom && <p>教室: {offering.classroom}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddOffering} className="mt-5 rounded-md border border-border bg-background p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Plus className="size-4 text-primary" />
                    <h3 className="text-sm font-bold text-slate-900">開講情報を追加</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOfferingFormOpen((prev) => !prev)}
                    className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-expanded={isOfferingFormOpen}
                  >
                    {isOfferingFormOpen ? "閉じる" : "開く"}
                    <ChevronDown className={`size-4 transition-transform ${isOfferingFormOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {isOfferingFormOpen && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <OfferingInput
                        label="教授名"
                        value={offeringForm.teacher_name}
                        onChange={(value) => setOfferingForm((prev) => ({ ...prev, teacher_name: value }))}
                        required
                      />
                      <OfferingInput
                        label="受講年度"
                        value={offeringForm.academic_year}
                        onChange={(value) => setOfferingForm((prev) => ({ ...prev, academic_year: value }))}
                        inputMode="numeric"
                      />
                      <OfferingSelect
                        label="学期"
                        value={offeringForm.semester}
                        onChange={(value) => setOfferingForm((prev) => ({ ...prev, semester: value }))}
                        options={SEMESTER_OPTIONS.map((option) => option.value)}
                        getLabel={(value) => SEMESTER_OPTIONS.find((option) => option.value === value)?.label ?? value}
                        required
                      />
                      <OfferingSelect
                        label="曜日"
                        value={offeringForm.day_of_week}
                        onChange={(value) => setOfferingForm((prev) => ({ ...prev, day_of_week: value }))}
                        options={DAY_OF_WEEK_OPTIONS.map((option) => option.value)}
                        getLabel={(value) => DAY_OF_WEEK_OPTIONS.find((option) => option.value === value)?.label ?? value}
                      />
                      <OfferingSelect
                        label="授業形態"
                        value={offeringForm.delivery_method}
                        onChange={(value) => setOfferingForm((prev) => ({ ...prev, delivery_method: value }))}
                        options={DELIVERY_METHOD_OPTIONS.map((option) => option.value)}
                        getLabel={(value) => DELIVERY_METHOD_OPTIONS.find((option) => option.value === value)?.label ?? value}
                        required
                      />
                      <OfferingSelect
                        label="対象学年"
                        value={offeringForm.target_grade}
                        onChange={(value) => setOfferingForm((prev) => ({ ...prev, target_grade: value }))}
                        options={TARGET_GRADE_OPTIONS.map((option) => option.value)}
                        getLabel={(value) => TARGET_GRADE_OPTIONS.find((option) => option.value === value)?.label ?? value}
                        required
                      />
                      <OfferingInput
                        label="時限"
                        value={offeringForm.period}
                        onChange={(value) => setOfferingForm((prev) => ({ ...prev, period: value }))}
                        inputMode="numeric"
                      />
                      <OfferingSelect
                        label="キャンパス"
                        value={offeringForm.campus}
                        onChange={(value) => setOfferingForm((prev) => ({ ...prev, campus: value }))}
                        options={[...CAMPUS_OPTIONS]}
                        required
                      />
                      <OfferingInput
                        label="教室"
                        value={offeringForm.classroom}
                        onChange={(value) => setOfferingForm((prev) => ({ ...prev, classroom: value }))}
                      />
                    </div>

                    {offeringError && <p className="mt-3 rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">{offeringError}</p>}

                    <div className="mt-4 flex justify-end">
                      <Button
                        type={isAuthenticated === false ? "button" : "submit"}
                        disabled={isAddingOffering || isAuthenticated === null}
                        onClick={isAuthenticated === false ? () => setShowLoginModal(true) : undefined}
                        className="h-10 rounded-md"
                      >
                        <Plus className="size-4" />
                        {isAddingOffering ? "追加中..." : "追加"}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </section>

            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="size-5 text-primary" />
                <h2 className="text-lg font-bold text-slate-900">レビュー</h2>
              </div>

              {reviews.length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-background p-6 text-center">
                  <BookOpen className="mx-auto mb-3 size-9 text-muted-foreground" />
                  <p className="font-semibold text-slate-900">まだレビューがありません</p>
                  <p className="mt-2 text-sm text-muted-foreground">受講経験がある場合は最初のレビューを投稿できます。</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <article key={review.id} className="rounded-md border border-border bg-background p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{review.user.display_name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString("ja-JP")}</p>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          {review.rating}
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
                        <ReviewScore label="難易度" value={review.difficulty} />
                        <ReviewScore label="課題量" value={review.workload} />
                        <ReviewScore label="単位" value={review.grading} />
                      </div>
                      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
                        <ReviewMeta label="テスト" value={formatPresence(review.exam_presence)} />
                        <ReviewMeta label="出席確認" value={formatPresence(review.attendance_check)} />
                        <ReviewMeta label="教科書" value={review.textbook_required ? "必要" : "不要"} />
                      </div>
                      {review.comment && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.comment}</p>}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900">レビュー投稿</h2>
            </div>

            {currentUserReview ? (
              <div className="space-y-3">
                <div className="rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
                  <p className="font-semibold">この授業にはすでにレビュー済みです。</p>
                  <p className="mt-1">1授業につき1件まで投稿できます。</p>
                </div>
                {formError && <p className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">{formError}</p>}
                <Button
                  type="button"
                  variant="outline"
                  disabled={isDeleting}
                  onClick={handleDeleteReview}
                  className="h-11 w-full rounded-md border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                  {isDeleting ? "削除中..." : "レビューを削除"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {offerings.length > 0 && (
                  <label className="block">
                    <FieldLabel label="受講した開講回" required={false} />
                    <select
                      value={form.course_offering_id}
                      onChange={(event) => {
                        setForm((prev) => ({ ...prev, course_offering_id: event.target.value }));
                      }}
                      className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">指定しない</option>
                      {offerings.map((offering) => (
                        <option key={offering.id} value={offering.id}>
                          {formatCourseOfferingOption(offering)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

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
                    className="min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-base leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    maxLength={5000}
                    placeholder="授業の雰囲気、課題、テスト、履修判断に役立つ情報"
                  />
                </label>

                {formError && <p className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">{formError}</p>}

                <Button type="submit" disabled={isSubmitting || isAuthenticated === null} className="h-11 w-full rounded-md">
                  {isSubmitting ? "投稿中..." : "レビューを投稿"}
                </Button>
              </form>
            )}
          </aside>
        </div>
      </div>

      <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-xl font-bold text-slate-900">
        {icon}
        {value}
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function ScoreSummary({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="rounded-md bg-background p-3">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{formatAverage(value)}</p>
    </div>
  );
}

function ReviewScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-secondary px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ReviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  );
}

function courseOfferingBadges(offering: CourseOffering) {
  const labels = [visibleLabel(formatTargetGrade(offering.target_grade)), visibleLabel(formatDeliveryMethod(offering.delivery_method))].filter(Boolean);
  const semester = formatOptionalSemester(offering.semester);
  const schedule = formatSchedule(offering);

  if (semester) labels.push(semester);
  if (schedule) labels.push(schedule);
  if (offering.academic_year) labels.push(`${offering.academic_year}年度`);

  return labels;
}

function formatCourseOfferingOption(offering: CourseOffering) {
  return [offering.teacher_name, ...courseOfferingBadges(offering)].filter(Boolean).join(" ");
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
