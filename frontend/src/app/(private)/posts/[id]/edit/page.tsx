"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

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

export default function PostEditPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setTitle(data.title);
      setBody(data.body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("タイトルと本文を入力してください");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`/api/posts/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          post: {
            title: title.trim(),
            body: body.trim(),
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.errors
            ? Object.values(errorData.errors).flat().join(", ")
            : "更新に失敗しました"
        );
      }

      router.push(`/posts/${params.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
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
          <Link href={`/posts/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            詳細に戻る
          </Link>
        </Button>

        {/* 編集フォーム */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 sm:mb-6">投稿を編集</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* タイトル */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-2"
              >
                タイトル
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground transition-shadow"
                placeholder="投稿のタイトルを入力"
                required
              />
            </div>

            {/* 本文 */}
            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-foreground mb-2"
              >
                本文
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground resize-y transition-shadow"
                placeholder="投稿の本文を入力"
                required
              />
            </div>

            {/* ボタン */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
