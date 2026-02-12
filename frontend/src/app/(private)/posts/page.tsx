"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, User, MessageCircle } from "lucide-react";

interface Post {
  id: number;
  title: string;
  body: string;
  user: {
    id: number;
    display_name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/posts", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("投稿の取得に失敗しました");
      }

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchPosts}>再試行</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">投稿一覧</h1>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/posts/new">
              <Plus className="h-4 w-4 mr-2" />
              新規投稿
            </Link>
          </Button>
        </div>

        {/* 投稿一覧 */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-foreground text-lg font-medium mb-2">まだ投稿がありません</p>
            <p className="text-muted-foreground text-sm mb-6">最初の投稿を作成して、みんなと情報を共有しましょう</p>
            <Button asChild>
              <Link href="/posts/new">
                <Plus className="h-4 w-4 mr-2" />
                最初の投稿を作成
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block"
              >
                <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md hover:border-primary/30 transition-all">
                  <h2 className="text-lg sm:text-xl font-semibold text-card-foreground mb-2 sm:mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 line-clamp-3">
                    {post.body}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-primary/15 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span>{post.user?.display_name || "匿名"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="break-all">{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
