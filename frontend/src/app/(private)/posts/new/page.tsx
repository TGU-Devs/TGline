"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

export default function PostNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("タイトルと本文を入力してください");
      return;
    }

    try {
      setIsCreating(true);
      const res = await fetch("/api/posts", {
        method: "POST",
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
            : "投稿の作成に失敗しました"
        );
      }

      const data = await res.json();
      router.push(`/posts/${data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "投稿の作成に失敗しました");
    } finally {
      setIsCreating(false);
    }
  };

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

        {/* 新規投稿フォーム */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 sm:mb-6">新規投稿</h1>

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
                disabled={isCreating}
                className="w-full sm:w-auto"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? "作成中..." : "投稿する"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
