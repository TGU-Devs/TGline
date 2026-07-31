"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Cloud,
  ExternalLink,
  MessageSquare,
  Plus,
  Star,
} from "lucide-react";

import LoginPromptModal from "@/components/features/auth/LoginPromptModal";
import { courseOfferingBadges } from "@/components/features/courses/display";
import {
  formatAverage,
  ratingLabels,
} from "@/components/features/courses/labels";
import type { Course, CourseReview, CourseReviewsResponse } from "@/components/features/courses/types";
import ErrorUI from "@/components/ui/ErrorUI";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";

const COURSE_REQUEST_FORM_URL = "https://forms.gle/9UmZSNiZZWhZxE4JA";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const { user } = useUser();

  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
        throw new Error("レビュー情報の取得に失敗しました");
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
  }, [fetchCourseDetail]);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !course) {
    return <ErrorUI error={error ?? "授業が見つかりません"} fetch={fetchCourseDetail} />;
  }

  const offerings = course.course_offerings ?? [];
  const reviewCountsByOffering = reviews.reduce<Record<number, number>>((counts, review) => {
    if (review.course_offering_id) {
      counts[review.course_offering_id] = (counts[review.course_offering_id] ?? 0) + 1;
    }

    return counts;
  }, {});

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

        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900">開講情報</h2>
            </div>
            {user ? (
              <Button asChild className="h-10 rounded-md">
                <Link href={`/courses/${course.id}/offerings/new`}>
                  <Plus className="size-4" />
                  開講情報を追加
                </Link>
              </Button>
            ) : (
              <Button type="button" onClick={() => setShowLoginModal(true)} className="h-10 rounded-md">
                <Plus className="size-4" />
                開講情報を追加
              </Button>
            )}
          </div>

          {offerings.length === 0 ? (
            <p className="text-sm text-muted-foreground">開講情報はまだ登録されていません。</p>
          ) : (
            <div className="space-y-3">
              {offerings.map((offering) => (
                <Link
                  key={offering.id}
                  href={`/courses/${course.id}/offerings/${offering.id}`}
                  className="group block overflow-hidden rounded-lg border border-border bg-background transition hover:border-primary/40 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {courseOfferingBadges(offering).map((label) => (
                        <span
                          key={label}
                          className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground"
                        >
                          {label}
                        </span>
                      ))}
                    </div>

                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      <div className="min-w-0">
                        <dt className="text-xs font-medium text-muted-foreground">担当教員</dt>
                        <dd className="mt-1 break-words font-semibold text-slate-800">
                          {offering.teacher_name}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs font-medium text-muted-foreground">キャンパス</dt>
                        <dd className="mt-1 break-words font-semibold text-slate-800">
                          {offering.campus || "未登録"}
                        </dd>
                      </div>
                      {offering.classroom && (
                        <div className="min-w-0">
                          <dt className="text-xs font-medium text-muted-foreground">教室</dt>
                          <dd className="mt-1 break-words font-semibold text-slate-800">
                            {offering.classroom}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="flex min-h-12 items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                      <MessageSquare className="size-4 shrink-0 text-primary" />
                      <span>レビュー</span>
                      <span className="font-bold tabular-nums">
                        {reviewCountsByOffering[offering.id] ?? 0}件
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
                      <span>口コミを見る</span>
                      <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
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
