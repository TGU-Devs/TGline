"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRegex =
    /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("正しいメールアドレスを入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users/password_reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password_reset: { email } }),
      });

      if (res.status === 429) {
        setError(
          "リクエストが多すぎます。しばらく時間をおいてから再度お試しください。"
        );
        return;
      }

      // 成功（アカウント列挙防止のため、常に送信完了画面を表示）
      setIsSubmitted(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-card/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-border/50 w-full max-w-md">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center">
            <Mail className="text-sky-600" size={24} />
          </div>
          <h1 className="font-bold text-xl text-foreground">
            メールを送信しました
          </h1>
          <p className="text-sm text-muted-foreground">
            入力されたメールアドレス宛にパスワードリセットのリンクを送信しました。メールに記載されたリンクからパスワードを再設定してください。
          </p>
          <p className="text-xs text-muted-foreground">
            メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </p>
          <Link
            href="/login"
            className="block text-sm text-primary hover:underline mt-4"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-border/50 w-full max-w-md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-center font-bold text-xl text-foreground">
          パスワードをリセット
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
        </p>
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="font-medium text-sm text-foreground mb-1"
          >
            メールアドレス
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail size={18} />
            </div>
            <input
              type="email"
              id="email"
              placeholder="メールアドレスを入力してください"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-input rounded-lg p-2 pl-10 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          {error && <p className="text-destructive text-sm mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "送信中..." : "リセットリンクを送信"}
        </button>
        <div className="flex justify-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
