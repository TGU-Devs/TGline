"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, CalendarDays, ChevronRight, Plus, Search, SlidersHorizontal, Star } from "lucide-react";

import Loading from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/ErrorUI";
import { Button } from "@/components/ui/button";
import { formatAverage, formatDayOfWeek, formatDeliveryMethod, formatSemester, formatTargetGrade } from "@/components/features/courses/labels";
import { COURSE_CATEGORY_OPTIONS, FACULTY_DEPARTMENT_OPTIONS, TARGET_GRADE_OPTIONS } from "@/components/features/courses/options";

import type { Course, CoursesResponse } from "@/components/features/courses/types";

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [faculty, setFaculty] = useState(() => searchParams.get("faculty") ?? "");
  const [category, setCategory] = useState(() => searchParams.get("category") ?? "");
  const [targetGrade, setTargetGrade] = useState(() => searchParams.get("target_grade") ?? "");

  const currentQuery = searchParams.get("q") ?? "";
  const currentFaculty = searchParams.get("faculty") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentTargetGrade = searchParams.get("target_grade") ?? "";

  const fetchCourses = useCallback(
    async (targetPage = 1) => {
      try {
        setError(null);
        if (targetPage === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const params = new URLSearchParams();
        if (currentQuery) params.set("q", currentQuery);
        if (currentFaculty) params.set("faculty", currentFaculty);
        if (currentCategory) params.set("category", currentCategory);
        if (currentTargetGrade) params.set("target_grade", currentTargetGrade);
        params.set("page", String(targetPage));

        const res = await fetch(`/api/courses?${params.toString()}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("授業一覧の取得に失敗しました");
        }

        const data = (await res.json()) as CoursesResponse;
        setCourses((prev) => (targetPage === 1 ? data.courses : [...prev, ...data.courses]));
        setHasMore(data.has_next);
        setPage(targetPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [currentCategory, currentFaculty, currentQuery, currentTargetGrade],
  );

  const selectedFilters = useMemo(() => {
    return [
      currentFaculty,
      currentCategory,
      currentTargetGrade && formatTargetGrade(currentTargetGrade),
    ].filter(
      (filter): filter is string => Boolean(filter),
    );
  }, [currentCategory, currentFaculty, currentTargetGrade]);

  useEffect(() => {
    setQuery(currentQuery);
    setFaculty(currentFaculty);
    setCategory(currentCategory);
    setTargetGrade(currentTargetGrade);
    fetchCourses(1);
  }, [currentCategory, currentFaculty, currentQuery, currentTargetGrade, fetchCourses]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    if (faculty.trim()) {
      params.set("faculty", faculty.trim());
    } else {
      params.delete("faculty");
    }

    if (category.trim()) {
      params.set("category", category.trim());
    } else {
      params.delete("category");
    }

    if (targetGrade.trim()) {
      params.set("target_grade", targetGrade.trim());
    } else {
      params.delete("target_grade");
    }

    params.delete("page");
    router.replace(`/courses?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    setQuery("");
    setFaculty("");
    setCategory("");
    setTargetGrade("");
    router.replace("/courses", { scroll: false });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorUI error={error} fetch={() => fetchCourses(1)} />;
  }

  return (
    <main className="min-h-screen bg-background py-4 sm:py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <BookOpen className="size-4" />
              授業評価
            </p>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">授業を探す</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              授業名・先生名・学部から検索して、レビューと開講情報を確認できます。
            </p>
          </div>
          <Button asChild className="h-11 rounded-md">
            <Link href="/courses/new">
              <Plus className="size-4" />
              授業を追加
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSearch} className="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(140px,180px)_minmax(140px,150px)_minmax(120px,130px)_auto]">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">キーワード</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="授業名・先生名"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">学部</span>
              <select
                value={faculty}
                onChange={(event) => setFaculty(event.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">すべて</option>
                {FACULTY_DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option.faculty} value={option.faculty}>
                    {option.faculty}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">カテゴリ</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">すべて</option>
                {COURSE_CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">対象学年</span>
              <select
                value={targetGrade}
                onChange={(event) => setTargetGrade(event.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">すべて</option>
                {TARGET_GRADE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-2 md:col-span-2 xl:col-span-1">
              <Button type="submit" className="h-11 flex-1 rounded-md md:flex-none">
                <SlidersHorizontal className="size-4" />
                検索
              </Button>
              <Button type="button" variant="outline" onClick={handleClear} className="h-11 rounded-md">
                解除
              </Button>
            </div>
          </div>

          {selectedFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedFilters.map((filter) => (
                <span key={filter} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {filter}
                </span>
              ))}
            </div>
          )}
        </form>

        {courses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <BookOpen className="mx-auto mb-3 size-10 text-muted-foreground" />
            <p className="font-semibold text-slate-900">該当する授業がありません</p>
            <p className="mt-2 text-sm text-muted-foreground">検索条件を変えて探してください。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="block rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        {course.faculty}
                      </span>
                      {course.department && (
                        <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
                          {course.department}
                        </span>
                      )}
                      {course.category && (
                        <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                          {course.category}
                        </span>
                      )}
                    </div>
                    <h2 className="truncate text-lg font-bold text-slate-900">{course.name}</h2>
                    {course.primary_course_offering && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {course.primary_course_offering.teacher_name}・{course.primary_course_offering.academic_year}年度・
                        {formatSemester(course.primary_course_offering.semester)}
                        {course.primary_course_offering.day_of_week ? `・${formatDayOfWeek(course.primary_course_offering.day_of_week)}` : ""}
                        ・{formatDeliveryMethod(course.primary_course_offering.delivery_method)}
                        ・{formatTargetGrade(course.primary_course_offering.target_grade)}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-[auto_auto_auto] items-center gap-3 sm:flex sm:gap-5">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 font-bold text-slate-900">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        {formatAverage(course.average_rating)}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">平均</p>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900">{course.reviews_count}</div>
                      <p className="mt-1 text-xs text-muted-foreground">レビュー</p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {hasMore && courses.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              variant="outline"
              disabled={isLoadingMore}
              onClick={() => fetchCourses(page + 1)}
              className="rounded-md"
            >
              <CalendarDays className="size-4" />
              {isLoadingMore ? "読み込み中..." : "さらに表示"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
