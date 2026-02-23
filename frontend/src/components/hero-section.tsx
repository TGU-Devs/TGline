"use client";

import { ArrowRight, Bell, Calendar, Heart, MessageCircle, Home, User, PenSquare, BookOpen, Users, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/15 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/10 blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              誰でも自由に投稿できる
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
              東北学院大学生のための
              <span className="text-primary">情報共有アプリ</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed text-pretty">
              授業情報、サークル活動、学内イベント、なんでも投稿OK。
              TGUの学生同士でつながろう。
            </p>

            {/* Feature Tags */}
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <BookOpen className="h-4 w-4" />
                授業情報
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
                <Users className="h-4 w-4" />
                サークル
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <Calendar className="h-4 w-4" />
                学内イベント
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
                <Sparkles className="h-4 w-4" />
                その他色々
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-base font-semibold shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30 hover:scale-105"
              >
                <PenSquare className="mr-2 h-5 w-5" />
                投稿してみる
              </Button>
              <Link href="/posts">
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 text-foreground px-8 py-6 text-base font-semibold bg-transparent transition-all hover:bg-primary"
              >
                投稿を見る
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              </Link>
            </div>

          </div>

          {/* Right Content - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end animate-slide-up">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative">
      {/* Floating elements around phone */}
      <div className="absolute -top-4 -left-8 z-20 animate-float">
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
              <PenSquare className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-xs font-medium text-foreground">新規投稿</div>
              <div className="text-xs text-muted-foreground">たった今</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -right-8 z-20 animate-float" style={{ animationDelay: "1s" }}>
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xs font-medium text-foreground">メンバー募集中</div>
              <div className="text-xs text-muted-foreground">テニスサークル</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Frame */}
      <div className="relative z-10 w-[280px] sm:w-[320px] h-[560px] sm:h-[640px] bg-foreground rounded-[3rem] p-2 shadow-2xl">
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-foreground rounded-b-2xl z-20" />

        {/* Phone screen */}
        <div className="relative w-full h-full bg-background rounded-[2.5rem] overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-2 text-xs text-muted-foreground">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-muted-foreground rounded-sm">
                <div className="w-3/4 h-full bg-muted-foreground rounded-sm" />
              </div>
            </div>
          </div>

          {/* App Content */}
          <div className="px-4 pb-20">
            {/* Header - matches actual app */}
            <div className="flex items-center justify-between py-3">
              <h2 className="text-base font-bold text-foreground">投稿一覧</h2>
              <div className="bg-primary text-primary-foreground text-[10px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
                <PenSquare className="h-3 w-3" />
                新規投稿
              </div>
            </div>

            {/* Post Cards - matches actual app layout */}
            <div className="space-y-2.5 mt-1">
              <MockPostCard
                title="プログラミング勉強会メンバー募集"
                body="毎週水曜日に活動しています。初心者歓迎！"
                user="たろう"
                tag="サークル"
                tagType="topic"
                time="30分前"
                likes={42}
                comments={8}
              />
              <MockPostCard
                title="月曜2限の経済学、教室変更"
                body="来週から教室がH301に変わります。"
                user="はなこ"
                tag="工学部"
                tagType="faculty"
                time="2時間前"
                likes={28}
                comments={3}
              />
              <MockPostCard
                title="学園祭実行委員募集中"
                body="一緒に学園祭を盛り上げませんか？"
                user="じろう"
                tag="イベント"
                tagType="topic"
                time="昨日"
                likes={156}
                comments={24}
              />
            </div>
          </div>

          {/* Bottom Navigation - matches actual app MobileNav */}
          <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2.5">
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center">
                <Home className="h-5 w-5 text-primary" />
                <span className="text-[8px] mt-0.5 font-medium text-primary">投稿一覧</span>
              </div>
              <div className="flex flex-col items-center">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="text-[8px] mt-0.5 font-medium text-muted-foreground">通知</span>
              </div>
              <div className="flex flex-col items-center">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="text-[8px] mt-0.5 font-medium text-muted-foreground">設定</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockPostCard({
  title,
  body,
  user,
  tag,
  tagType,
  time,
  likes,
  comments,
}: {
  title: string;
  body: string;
  user: string;
  tag: string;
  tagType: "faculty" | "topic";
  time: string;
  likes: number;
  comments: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 transition-all">
      <h3 className="text-xs font-semibold text-foreground truncate mb-1.5">{title}</h3>
      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${
        tagType === "faculty"
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-orange-50 text-orange-700 border-orange-200"
      }`}>
        {tag}
      </span>
      <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1">{body}</p>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 bg-primary/15 rounded-full flex items-center justify-center">
            <User className="h-2 w-2 text-primary" />
          </div>
          <span>{user}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Calendar className="h-2.5 w-2.5" />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Heart className="h-2.5 w-2.5" />
          <span>{likes}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <MessageCircle className="h-2.5 w-2.5" />
          <span>{comments}</span>
        </div>
      </div>
    </div>
  );
}
