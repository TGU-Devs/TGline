"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertCircle, LogIn } from "lucide-react";

const VerifyEmailBody = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenRef = useRef(searchParams.get("token"));
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("メール認証を実行しています...");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verify = async () => {
      if (!tokenRef.current) {
        setIsLoading(false);
        setMessage("認証リンクが無効です。");
        return;
      }

      try {
        const res = await fetch("/api/users/email_verification", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email_verification: { token: tokenRef.current },
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setIsSuccess(true);
          setMessage(data.message || "メール認証が完了しました。ログインしています...");
        } else {
          setMessage(data.error || "認証に失敗しました。");
        }
      } catch {
        setMessage("通信エラーが発生しました。");
      } finally {
        setIsLoading(false);
        window.history.replaceState({}, "", "/verify-email");
      }
    };

    verify();
  }, []);

  useEffect(() => {
    if (!isSuccess) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess]);

  useEffect(() => {
    if (!isSuccess || countdown > 0) return;
    router.replace("/posts");
  }, [isSuccess, countdown, router]);

  return (
    <div className="bg-card/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-border/50 w-full max-w-md text-center space-y-5">
      <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
        {isLoading ? (
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
        ) : isSuccess ? (
          <CheckCircle2 className="h-7 w-7 text-primary" />
        ) : (
          <AlertCircle className="h-7 w-7 text-destructive" />
        )}
      </div>

      <h1 className="text-2xl font-bold text-foreground">
        {isLoading ? "メール認証中..." : isSuccess ? "メール認証が完了しました" : "メール認証に失敗しました"}
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>

      {isSuccess && (
        <p className="text-sm text-primary font-medium">
          {countdown}秒後に投稿一覧へ移動します
        </p>
      )}

      {!isLoading && !isSuccess && (
        <div className="space-y-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <LogIn className="h-4 w-4" />
            ログイン画面へ
          </Link>
          <p className="text-xs text-muted-foreground">
            リンク期限切れの場合は、ログイン画面から認証メールを再送してください。
          </p>
        </div>
      )}
    </div>
  );
};

const VerifyEmailPage = () => {
  return (
    <Suspense>
      <VerifyEmailBody />
    </Suspense>
  );
};

export default VerifyEmailPage;
