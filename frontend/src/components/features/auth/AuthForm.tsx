"use client";

import { useState, FormEvent } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

import Link from "next/link";
import FormItem from "./FormItem";
import { Button } from "@/components/ui/button";

import { User, Mail, KeyRound, RotateCcwKey, Eye, EyeOff } from "lucide-react";

type RailsErrorResponse = {
    errors?: Record<string, string | string[]>;
    error?: string;
  };

type AuthFormProps = {
    isRegister: boolean;
};

type FormValues = {
    display_name?: string;
    email: string;
    password: string;
    confirmPassword?: string;
};

type Errors = {
    display_name?: string | string[];
    email?: string | string[];
    password?: string | string[];
    password_confirmation?: string | string[];
    confirmPassword?: string;
    main?: string;
};

export type FormItemType = {
    id: keyof FormValues;
    label: string;
    type: "email" | "password";
    icon: React.ComponentType;
};

const formItem: FormItemType[] = [
    {
        id: "email",
        label: "メールアドレス",
        type: "email",
        icon: Mail,
    },
    {
        id: "password",
        label: "パスワード",
        type: "password",
        icon: KeyRound,
    },
];

const initFormValues = {
    display_name: "",
    email: "",
    password: "",
    confirmPassword: "",
};

const AuthForm = ({ isRegister }: AuthFormProps) => {
    const [formValues, setFormValues] = useState(initFormValues);
    const [formErrors, setFormErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const onchangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    // Railsのエラー形式をフォーマット
    const formatErrors = (data: RailsErrorResponse): Errors => {
        const formattedErrors: Errors = {};

        if (data.errors) {
            Object.keys(data.errors).forEach((key) => {
                const errorValue = data.errors![key];
                formattedErrors[key as keyof Errors] = Array.isArray(errorValue)
                    ? errorValue[0]
                    : errorValue;
            });
        }

        return formattedErrors;
    };

    // エラーハンドリング
    const handleError = (data: RailsErrorResponse, defaultMessage: string) => {
        if (data.errors) {
            setFormErrors(formatErrors(data));
            return;
        }

        if (data.error) {
            setFormErrors({ main: data.error });
            return;
        }

        setFormErrors({ main: defaultMessage });
    };

    // サインアップ処理
    const handleSignUp = async () => {
        const response = await fetch("/api/users/sign_up", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                user: {
                    display_name: formValues.display_name,
                    email: formValues.email,
                    password: formValues.password,
                    password_confirmation: formValues.confirmPassword,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            handleError(data, "登録に失敗しました");
            return;
        }

        window.location.href = "/posts";
    };

    // サインイン処理
    const handleSignIn = async () => {
        const response = await fetch("/api/users/sign_in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                session: {
                    email: formValues.email,
                    password: formValues.password,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            handleError(data, "ログインに失敗しました");
            return;
        }

        window.location.href = "/posts";
    };

    // Googleログイン処理 credentialResponse: Googleから返されるクレデンシャル情報
    const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            setFormErrors({ main: "Googleログインに失敗しました" });
            return;
        }

        setIsLoading(true);
        setFormErrors({});

        try {
            const response = await fetch("/api/users/google_sign_in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_token: credentialResponse.credential }),
            });

            const data = await response.json();

            if (!response.ok) {
                handleError(data, "Googleログインに失敗しました");
                return;
            }

            window.location.href = "/posts";
        } catch (error) {
            console.error("Google login error:", error);
            setFormErrors({ main: "サーバーエラーが発生しました" });
        } finally {
            setIsLoading(false);
        }
    };

    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errors = validata(formValues);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setIsLoading(true);

        try {
            if (isRegister) {
                await handleSignUp();
            } else {
                await handleSignIn();
            }
        } catch (error) {
            console.error("AuthForm error:", error);
            setFormErrors({ main: "サーバーエラーが発生しました" });
        } finally {
            setIsLoading(false);
        }
    };

    const validata = (values: FormValues) => {
        const errors: Errors = {};
        const emailRegex =
            /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

        // メールアドレスのバリデーション
        if (!values.email) {
            errors.email = "メールアドレスを入力してください";
        } else if (!emailRegex.test(values.email)) {
            errors.email = "正しいメールアドレスを入力してください";
        }

        // パスワードのバリデーション
        if (!values.password) {
            errors.password = "パスワードを入力してください";
        } else if (isRegister) {
            if (values.password.length < 8) {
                errors.password = "8文字以上のパスワードを入力してください";
            } else if (!/[A-Z]/.test(values.password)) {
                errors.password = "パスワードには大文字を含めてください";
            } else if (!/[a-z]/.test(values.password)) {
                errors.password = "パスワードには小文字を含めてください";
            } else if (!/[0-9]/.test(values.password)) {
                errors.password = "パスワードには数字を含めてください";
            }
        }

        // 登録時の追加バリデーション
        if (isRegister) {
            // 表示名のバリデーション
            if (!values.display_name || values.display_name.trim().length === 0) {
                errors.display_name = "ユーザー名を入力してください";
            }

            // パスワード確認のバリデーション
            if (!values.confirmPassword) {
                errors.confirmPassword = "パスワード確認を入力してください";
            } else if (values.confirmPassword.length < 8) {
                errors.confirmPassword = "8文字以上のパスワードを入力してください";
            } else if (values.password !== values.confirmPassword) {
                errors.confirmPassword = "パスワードが一致しません";
            }
        }

        return errors;
    };

    return (
        <div className="bg-card/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-border/50 w-full max-w-md">
            <form className="space-y-4" onSubmit={(e) => submitHandler(e)}>
                <h1 className="text-center font-bold text-xl text-foreground">{isRegister ? "新規登録" : "ログイン"}</h1>
                {isRegister && (
                    <div className="flex flex-col">
                        <label htmlFor="display_name" className="font-medium text-sm text-foreground mb-1">ユーザー名</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <User size={18} />
                            </div>
                        <input
                            type="text"
                            name="display_name"
                            placeholder="ユーザー名"
                            value={formValues.display_name}
                            onChange={(e) => onchangeHandler(e)}
                            className="border border-input rounded-lg p-2 pl-10 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                        />
                        </div>
                        {formErrors.display_name && (
                            <p className="text-destructive text-sm mt-1">
                                {Array.isArray(formErrors.display_name)
                                    ? formErrors.display_name[0]
                                    : formErrors.display_name}
                            </p>
                        )}
                    </div>
                )}
                {formItem.map((item) => (
                    <FormItem
                        key={item.id}
                        item={item}
                        value={formValues[item.id]}
                        icon={item.icon}
                        onchangeHandler={onchangeHandler}
                        error={
                            formErrors[item.id]
                                ? Array.isArray(formErrors[item.id])
                                    ? (formErrors[item.id]?.[0] as string)
                                    : (formErrors[item.id] as string)
                                : undefined
                        }
                    />
                ))}
                {isRegister && (
                    <div className="flex flex-col">
                        <label htmlFor="confirmPassword" className="font-medium text-sm text-foreground mb-1">
                            パスワード確認用
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <RotateCcwKey size={18} />
                            </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="パスワード確認用"
                            value={formValues.confirmPassword}
                            onChange={(e) => onchangeHandler(e)}
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
                        {formErrors.confirmPassword && (
                            <p className="text-destructive text-sm mt-1">{formErrors.confirmPassword}</p>
                        )}
                    </div>
                )}
                {isRegister && (
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                    />
                    <label htmlFor="termsAccepted" className="text-sm text-muted-foreground cursor-pointer">
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        利用規約
                      </a>
                      {" と "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        セキュリティポリシー
                      </a>
                      {" に同意する"}
                    </label>
                  </div>
                )}
                {formErrors.main && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                        {formErrors.main}
                    </div>
                )}
                <Button className="w-full" type="submit" disabled={isLoading || (isRegister && !termsAccepted)}>
                    {isLoading ? "処理中..." : isRegister ? "登録" : "ログイン"}
                </Button>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-card px-2 text-muted-foreground">または</span>
                    </div>
                </div>

                <div className={`flex justify-center ${isRegister && !termsAccepted ? "pointer-events-none opacity-50" : ""}`}>
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => setFormErrors({ main: "Googleログインに失敗しました" })}
                        text={isRegister ? "signup_with" : "signin_with"}
                        width="100%"
                    />
                </div>

                <div className="flex justify-center gap-2 text-sm">
                    <p className="text-muted-foreground">
                        {isRegister
                            ? "すでにアカウントをお持ちの方は"
                            : "新規登録は"}
                    </p>
                    <Link href={isRegister ? "/login" : "/register"} className="text-primary hover:underline font-medium">
                        こちら
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AuthForm;
