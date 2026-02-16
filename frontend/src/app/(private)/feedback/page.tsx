"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageCircleQuestion } from "lucide-react";

const CATEGORIES = [
  { value: "bug", label: "バグ報告" },
  { value: "feature_request", label: "機能要望" },
  { value: "question", label: "質問" },
  { value: "other", label: "その他" },
];

export default function FeedbackPage() {
  const router = useRouter();
  const [category, setCategory] = useState("question");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!subject.trim() || !body.trim()) {
      setError("件名と本文を入力してください");
      return;
    }

    if (body.length < 10) {
      setError("本文は10文字以上入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ feedback: { category, subject, body } }),
      });

      if (res.ok) {
        router.push("/settings?feedback=success");
      } else {
        const data = await res.json();
        setError(data.errors?.join(", ") || "送信に失敗しました");
      }
    } catch (err) {
      setError("送信中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-sky-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-sky-500 text-white">
            <MessageCircleQuestion size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">お問い合わせ</h1>
            <p className="text-slate-500 text-sm mt-1">
              バグ報告・機能要望・ご質問などをお送りください
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          {/* カテゴリー選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              カテゴリー
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 件名 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              件名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              placeholder="件名を入力してください"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-1">
              {subject.length}/100文字
            </p>
          </div>

          {/* 本文 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              本文 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
              rows={8}
              placeholder="詳細を入力してください(10文字以上)"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              {body.length}/2000文字(最低10文字)
            </p>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {isSubmitting ? "送信中..." : "送信する"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
