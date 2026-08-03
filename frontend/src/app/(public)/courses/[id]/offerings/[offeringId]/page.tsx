"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Edit3, MessageSquare, Star } from "lucide-react";

import LoginPromptModal from "@/components/features/auth/LoginPromptModal";
import {
  formatCourseOfferingOption,
  reviewStats,
} from "@/components/features/courses/display";
import {
  formatAverage,
  formatPresence,
  formatRatingScore,
  ratingLabels,
  type RatingScoreField,
} from "@/components/features/courses/labels";
import type { Course, CourseReview, CourseReviewsResponse } from "@/components/features/courses/types";
import ErrorUI from "@/components/ui/ErrorUI";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";

export default function CourseOfferingDetailPage() {
  const params = useParams<{ id: string; offeringId: string }>();
  const courseId = params.id;
  const offeringId = Number(params.offeringId);
  const { user } = useUser();

  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchOfferingDetail = useCallback(async () => {
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
    fetchOfferingDetail();
  }, [fetchOfferingDetail]);

  const offering = useMemo(() => {
    return course?.course_offerings?.find((item) => item.id === offeringId);
  }, [course, offeringId]);

  const offeringReviews = useMemo(() => {
    return reviews.filter((review) => review.course_offering_id === offeringId);
  }, [offeringId, reviews]);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !course || !offering) {
    return <ErrorUI error={error ?? "開講情報が見つかりません"} fetch={fetchOfferingDetail} />;
  }

  const stats = reviewStats(offeringReviews);

  return (
    <main className="min-h-screen bg-background py-4 sm:py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/courses/${course.id}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft className="size-4" />
            授業詳細へ戻る
          </Link>
          {user ? (
            <Button asChild className="h-11 rounded-md">
              <Link href={`/courses/${course.id}/offerings/${offering.id}/reviews/new`}>
                <Edit3 className="size-4" />
                口コミを投稿する
              </Link>
            </Button>
          ) : (
            <Button type="button" onClick={() => setShowLoginModal(true)} className="h-11 rounded-md">
              <Edit3 className="size-4" />
              口コミを投稿する
            </Button>
          )}
        </div>

        <section className="mb-5 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2">
                {course.category && (
                  <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {course.category}
                  </span>
                )}
              </div>
              <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">{course.name}</h1>
              <p className="mt-2 text-sm font-semibold text-primary">{formatCourseOfferingOption(offering)}</p>
            </div>

            <div className="w-full space-y-3 lg:w-[320px]">
              <div className="grid grid-cols-2 gap-3">
                <Metric label="平均評価" value={formatAverage(stats.average_rating)} icon={<Star className="size-4 fill-amber-400 text-amber-400" />} />
                <Metric label="レビュー" value={String(stats.reviews_count)} icon={<MessageSquare className="size-4 text-primary" />} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ScoreSummary field="difficulty" value={stats.average_difficulty} />
            <ScoreSummary field="workload" value={stats.average_workload} />
            <ScoreSummary field="grading" value={stats.average_grading} />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900">レビュー</h2>
          </div>

          {offeringReviews.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-background p-6 text-center">
              <BookOpen className="mx-auto mb-3 size-9 text-muted-foreground" />
              <p className="font-semibold text-slate-900">まだレビューがありません</p>
              <p className="mt-2 text-sm text-muted-foreground">この開講情報を受講した人の口コミを投稿できます。</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offeringReviews.map((review) => (
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
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <ReviewScore field="difficulty" value={review.difficulty} />
                    <ReviewScore field="workload" value={review.workload} />
                    <ReviewScore field="grading" value={review.grading} />
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

function ScoreSummary({ field, value }: { field: RatingScoreField; value: number | null | undefined }) {
  return (
    <div className="rounded-md bg-background p-3">
      <p className="text-xs font-semibold text-muted-foreground">{ratingLabels[field]}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{formatRatingScore(field, value)}</p>
    </div>
  );
}

function ReviewScore({ field, value }: { field: RatingScoreField; value: number }) {
  return (
    <div className="rounded-md bg-secondary px-3 py-2">
      <p className="text-xs text-muted-foreground">{ratingLabels[field]}</p>
      <p className="font-bold text-slate-900">{formatRatingScore(field, value)}</p>
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
