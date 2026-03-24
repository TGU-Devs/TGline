"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { validatePassword, validatePasswordConfirmation } from "@/lib/validators";

type FormErrors = {
  password?: string;
  password_confirmation?: string;
  general?: string;
};

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  // useRefでトークンを保持（replaceStateでURLから除去した後も使えるように）
  const tokenRef = useRef(searchParams.get("token"));

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // URLからトークンを除去（セキュリティ対策）
  useEffect(() => {
    if (tokenRef.current) {
      window.history.replaceState({}, "", "/reset-password");
    }
  }, []);

  if (!tokenRef.current) {
    return (
      <div className="bg-card/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-border/50 w-full max-w-md">
        <div className="text-center space-y-4">
          <h1 className="font-bold text-xl text-foreground">
            無効なリンクです
          </h1>
          <p className="text-sm text-muted-foreground">
            パスワードリセットのリンクが無効です。もう一度リセットを要求してください。
          </p>
          <Link
            href="/forgot-password"
            className="block text-sm text-primary hover:underline"
          >
            パスワードリセットを再要求
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    const confirmError = validatePasswordConfirmation(
      password,
      passwordConfirmation
    );
    if (confirmError) {
      newErrors.password_confirmation = confirmError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users/password_reset", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          password_reset: {
            reset_password_token: tokenRef.current,
            password,
            password_confirmation: passwordConfirmation,
          },
        }),
      });

      if (res.ok) {
        // 自動ログイン成功、ホームに遷移
        window.location.href = "/posts";
      } else {
        const data = await res.json();
        setErrors({
          general:
            data.errors?.[0] || "トークンが無効または期限切れです。もう一度リセットを要求してください。",
        });
      }
    } catch {
      setErrors({ general: "通信エラーが発生しました" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-border/50 w-full max-w-md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-center font-bold text-xl text-foreground">
          新しいパスワードを設定
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          新しいパスワードを入力してください。
        </p>

        {/* 新しいパスワード */}
        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="font-medium text-sm text-foreground mb-1"
          >
            新しいパスワード
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <KeyRound size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="新しいパスワードを入力してください"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-input rounded-lg p-2 pl-10 pr-10 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* パスワード確認 */}
        <div className="flex flex-col">
          <label
            htmlFor="password_confirmation"
            className="font-medium text-sm text-foreground mb-1"
          >
            パスワード確認
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <KeyRound size={18} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="password_confirmation"
              placeholder="パスワードを再度入力してください"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="border border-input rounded-lg p-2 pl-10 pr-10 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-destructive text-sm mt-1">
              {errors.password_confirmation}
            </p>
          )}
        </div>

        {/* 一般エラー */}
        {errors.general && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
            {errors.general}
            <Link
              href="/forgot-password"
              className="block mt-2 text-primary hover:underline"
            >
              もう一度リセットを要求する
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "設定中..." : "パスワードを設定"}
        </button>
      </form>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;
