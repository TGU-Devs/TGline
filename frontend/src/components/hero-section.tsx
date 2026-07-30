"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  MessageSquare,
  Plus,
  Star,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { notoSansJP } from "@/lib/fonts";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl motion-safe:animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/15 blur-3xl motion-safe:animate-pulse" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center motion-safe:animate-fade-in lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              <BookOpen className="size-4" />
              履修前に、みんなの授業評価をチェック
            </div>

            <h1 className={`${notoSansJP.className} text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl`}>
              <span className="inline-block whitespace-nowrap">東北学院大生のための</span>
              <br />
              <span className="text-primary">情報共有アプリ</span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:ml-0">
              授業の口コミを探したり、
              <br />
              学内情報をみんなで共有できます。
            </p>
            <p className="mx-auto mt-3 max-w-xl text-xs text-muted-foreground/90 sm:text-sm lg:ml-0">
              ※ 本サービスは東北学院大学の公式サービスではありません（学生有志による運営です）。
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <BookOpen className="size-4" />
                授業評価
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
                <Users className="size-4" />
                サークル
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <Calendar className="size-4" />
                学内イベント
              </span>
            </div>

            <div className="mx-auto mt-10 flex max-w-xs flex-col items-stretch justify-center gap-4 sm:max-w-none sm:flex-row sm:items-start lg:mx-0 lg:justify-start">
              <Button asChild size="lg" className="h-12 w-full px-8 text-base font-semibold shadow-lg shadow-primary/20 sm:w-auto">
                <Link href="/courses">
                  <BookOpen className="mr-2 size-5" />
                  授業評価を見る
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 w-full border-primary/30 bg-transparent px-8 text-base font-semibold sm:w-auto">
                <Link href="/posts">
                  投稿を見る
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative flex justify-center motion-safe:animate-slide-up lg:justify-end">
            <CourseReviewMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseReviewMockup() {
  return (
    <div className="relative">
      <div className="absolute -left-5 -top-4 z-20 motion-safe:animate-float sm:-left-8">
        <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-amber-100">
              <Star className="size-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-medium text-foreground">評価 4.5</div>
              <div className="text-xs text-muted-foreground">レビュー12件</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -right-5 z-20 motion-safe:animate-float sm:-right-8">
        <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/15">
              <MessageSquare className="size-4 text-primary" />
            </div>
            <div>
              <div className="text-xs font-medium text-foreground">新しい口コミ</div>
              <div className="text-xs text-muted-foreground">履修の参考に</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 h-[560px] w-[280px] rounded-[3rem] bg-foreground p-2 shadow-2xl sm:h-[640px] sm:w-[320px]">
        <div className="absolute left-1/2 top-0 z-20 h-7 w-32 -translate-x-1/2 rounded-b-2xl bg-foreground" />

        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-background">
          <div className="flex items-center justify-between px-6 pb-2 pt-3 text-xs text-muted-foreground">
            <span>9:41</span>
            <div className="h-2 w-4 rounded-sm border border-muted-foreground">
              <div className="h-full w-3/4 rounded-sm bg-muted-foreground" />
            </div>
          </div>

          <div className="px-3 pb-20">
            <div className="flex items-center justify-between py-3">
              <h2 className="text-sm font-bold text-foreground">授業評価</h2>
              <div className="flex items-center gap-1 rounded-xl bg-primary px-2.5 py-1.5 text-[10px] font-medium text-primary-foreground">
                <Plus className="size-3" />
                授業追加
              </div>
            </div>

            <div className="mt-1 space-y-2.5">
              <MockCourseCard
                name="英語1A"
                teacher="佐藤先生"
                category="教養科目"
                rating="4.5"
                reviews={12}
              />
              <MockCourseCard
                name="データベース論"
                teacher="田中先生"
                category="専門科目"
                rating="4.2"
                reviews={8}
              />
              <MockCourseCard
                name="心理学"
                teacher="鈴木先生"
                category="教養科目"
                rating="3.9"
                reviews={15}
              />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 border-t border-border bg-card px-4 py-2.5">
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center text-muted-foreground">
                <MessageSquare className="size-5" />
                <span className="mt-0.5 text-[8px] font-medium">投稿</span>
              </div>
              <div className="flex flex-col items-center text-primary">
                <BookOpen className="size-5" />
                <span className="mt-0.5 text-[8px] font-medium">授業評価</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockCourseCard({
  name,
  teacher,
  category,
  rating,
  reviews,
}: {
  name: string;
  teacher: string;
  category: string;
  rating: string;
  reviews: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-medium text-primary">
        {category}
      </span>
      <h3 className="mt-2 text-xs font-semibold text-foreground">{name}</h3>
      <p className="mt-1 text-[10px] text-muted-foreground">{teacher}</p>
      <div className="mt-3 flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1 font-semibold text-foreground">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {rating}
        </span>
        <span className="text-muted-foreground">レビュー {reviews}件</span>
      </div>
    </div>
  );
}
