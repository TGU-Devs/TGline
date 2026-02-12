"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, User, Edit, Trash2, ArrowLeft } from "lucide-react";

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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
    }
  }, [params.id]);

  const fetchPost = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/posts/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("投稿が見つかりません");
        }
        throw new Error("投稿の取得に失敗しました");
      }

      const data = await res.json();
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("本当にこの投稿を削除しますか？")) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/posts/${params.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("削除に失敗しました");
      }

      router.push("/posts");
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setIsDeleting(false);
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "投稿が見つかりません"}</p>
          <Button asChild variant="outline">
            <Link href="/posts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              一覧に戻る
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* 戻るボタン */}
        <Button
          asChild
          variant="ghost"
          className="mb-4 sm:mb-6 text-muted-foreground hover:text-foreground"
        >
          <Link href="/posts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            一覧に戻る
          </Link>
        </Button>

        {/* 投稿カード */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 lg:p-8">
          {/* ヘッダー */}
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-3 sm:mb-4 wrap-break-words">
                {post.title}
              </h1>
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                asChild
                variant="outline"
                className="flex-1 sm:flex-initial"
              >
                <Link href={`/posts/${post.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">編集</span>
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 sm:flex-initial"
              >
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{isDeleting ? "削除中..." : "削除"}</span>
              </Button>
            </div>
          </div>

          {/* 本文 */}
          <div className="prose max-w-none">
            <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap wrap-break-words">
              {post.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
