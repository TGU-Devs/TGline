// frontend/src/app/(private)/posts/new/page.tsx
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
      // 作成された投稿の詳細ページにリダイレクト
      router.push(`/posts/${data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "投稿の作成に失敗しました");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f8ff] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 戻るボタン */}
        <Button
          asChild
          variant="ghost"
          className="mb-6 text-slate-600 hover:text-slate-800"
        >
          <Link href="/posts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            一覧に戻る
          </Link>
        </Button>

        {/* 新規投稿フォーム */}
        <div className="bg-[#fefefe] rounded-lg shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">新規投稿</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* タイトル */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                タイトル
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white text-slate-800"
                placeholder="投稿のタイトルを入力"
                required
              />
            </div>

            {/* 本文 */}
            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                本文
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white text-slate-800 resize-y"
                placeholder="投稿の本文を入力"
                required
              />
            </div>

            {/* ボタン */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isCreating}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-sky-500 hover:bg-sky-600 text-white"
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