"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Users, FileText, MessageCircle } from "lucide-react";

interface AdminStats {
  counts: {
    users: number;
    posts: number;
    comments: number;
  };
  trends: {
    users_today: number;
    users_this_week: number;
    posts_today: number;
    posts_this_week: number;
    comments_today: number;
    comments_this_week: number;
  };
  recent_activity: {
    posts: {
      id: number;
      title: string;
      user_display_name: string;
      created_at: string;
    }[];
    comments: {
      id: number;
      body: string;
      user_display_name: string;
      post_title: string;
      post_id: number;
      created_at: string;
    }[];
  };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== "admin")) {
      router.replace("/posts");
    }
  }, [user, userLoading, router]);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/admin/stats", { credentials: "include" });

      if (!res.ok) {
        throw new Error("統計データの取得に失敗しました");
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchStats();
    }
  }, [user, fetchStats]);

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchStats}>再試行</Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      icon: Users,
      label: "ユーザー数",
      count: stats.counts.users,
      today: stats.trends.users_today,
      week: stats.trends.users_this_week,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: FileText,
      label: "投稿数",
      count: stats.counts.posts,
      today: stats.trends.posts_today,
      week: stats.trends.posts_this_week,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      icon: MessageCircle,
      label: "コメント数",
      count: stats.counts.comments,
      today: stats.trends.comments_today,
      week: stats.trends.comments_this_week,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            管理ダッシュボード
          </h1>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 ${card.iconBg} rounded-full flex items-center justify-center`}
                >
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <span className="text-sm text-muted-foreground">
                  {card.label}
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {card.count.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                +{card.today} 今日 / +{card.week} 今週
              </p>
            </div>
          ))}
        </div>

        {/* 最近のアクティビティ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 最近の投稿 */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              最近の投稿
            </h2>
            {stats.recent_activity.posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">投稿はまだありません</p>
            ) : (
              <div className="space-y-3">
                {stats.recent_activity.posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block rounded-xl p-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{post.user_display_name}</span>
                      <span>·</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 最近のコメント */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              最近のコメント
            </h2>
            {stats.recent_activity.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">コメントはまだありません</p>
            ) : (
              <div className="space-y-3">
                {stats.recent_activity.comments.map((comment) => (
                  <Link
                    key={comment.id}
                    href={`/posts/${comment.post_id}`}
                    className="block rounded-xl p-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm text-foreground line-clamp-1">
                      {comment.body}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{comment.user_display_name}</span>
                      <span>·</span>
                      <span className="line-clamp-1">{comment.post_title}</span>
                      <span>·</span>
                      <span className="shrink-0">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
