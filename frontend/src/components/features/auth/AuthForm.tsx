"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import FormItem from "./FormItem";

import { User, Mail, KeyRound, RotateCcwKey } from "lucide-react";

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
    const router = useRouter();

    const [formValues, setFormValues] = useState(initFormValues);
    const [formErrors, setFormErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);

    const onchangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    // Railsのエラー形式をフォーマット
    const formatErrors = (data: any): Errors => {
        const formattedErrors: Errors = {};
        
        if (data.errors) {
            Object.keys(data.errors).forEach((key) => {
                const errorValue = data.errors[key];
                formattedErrors[key as keyof Errors] = Array.isArray(errorValue)
                    ? errorValue[0]
                    : errorValue;
            });
        }
        
        return formattedErrors;
    };

    // エラーハンドリング
    const handleError = (data: any, defaultMessage: string) => {
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

        router.push("/posts");
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

        router.push("/posts");
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
        } else if (values.password.length < 6) {
            errors.password = "6文字以上のパスワードを入力してください";
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
            } else if (values.confirmPassword.length < 6) {
                errors.confirmPassword = "6文字以上のパスワードを入力してください";
            } else if (values.password !== values.confirmPassword) {
                errors.confirmPassword = "パスワードが一致しません";
            }
        }

        return errors;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <form className="space-y-4" onSubmit={(e) => submitHandler(e)}>
                <h1 className="text-center font-bold text-xl text-slate-800">{isRegister ? "新規登録" : "ログイン"}</h1>
                {isRegister && (
                    <div className="flex flex-col">
                        <label htmlFor="display_name" className="font-medium text-sm text-slate-700 mb-1">ユーザー名</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <User size={18} />
                            </div>
                        <input
                            type="text"
                            name="display_name"
                            placeholder="ユーザー名"
                            value={formValues.display_name}
                            onChange={(e) => onchangeHandler(e)}
                            className="border-solid border-2 border-gray-100 rounded-md p-1 pl-10 w-full placeholder:text-slate-400"
                        />
                        </div>
                        {formErrors.display_name && (
                            <p className="text-red-500 text-sm mt-1">
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
                        <label htmlFor="confirmPassword" className="font-medium text-sm text-slate-700 mb-1">
                            パスワード確認用
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <RotateCcwKey size={18} />
                            </div>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="パスワード確認用"
                            value={formValues.confirmPassword}
                            onChange={(e) => onchangeHandler(e)}
                            className="border-solid border-2 border-gray-100 rounded-md p-1 pl-10 w-full placeholder:text-slate-400"
                        />
                        </div>
                        {formErrors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                        )}
                    </div>
                )}
                {formErrors.main && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {formErrors.main}
                    </div>
                )}
                <button className="w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 transition-colors" type="submit">
                    {isLoading ? "処理中..." : isRegister ? "登録" : "ログイン"}
                </button>
                <div className="flex justify-center gap-2 text-sm">
                    <p className="text-slate-700">
                        {isRegister
                            ? "すでにアカウントをお持ちの方は"
                            : "新規登録は"}
                    </p>
                    <Link href={isRegister ? "/login" : "/register"} className="text-sky-700 hover:underline ">
                        こちら
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AuthForm;
