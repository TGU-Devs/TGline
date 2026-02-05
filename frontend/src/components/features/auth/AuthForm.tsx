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
    username?: string;
    email: string;
    password: string;
    confirmPassword?: string;
};

type Errors = {
    username?: string;
    email?: string;
    password?: string;
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
    username: "",
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
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: formValues.username,
                        email: formValues.email,
                        password: formValues.password,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    if (data.errors) {
                        setFormErrors(data.errors);
                    } else {
                        setFormErrors({ main: "登録に失敗しました" });
                    }
                    return;
                }

                router.push("/login");
            } else {
                //ログイン処理
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: formValues.email,
                        password: formValues.password,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    if (data.errors) {
                        setFormErrors(data.errors);
                    } else {
                        setFormErrors({ main: "ログインに失敗しました" });
                    }
                    return;
                }

                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                }

                router.push("/posts");
                console.log("ログイン成功:", data);
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
        const regex =
            /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

        if (!values.email) {
            errors.email = "メールアドレスを入力してください";
        } else if (!regex.test(values.email)) {
            errors.email = "正しいメールアドレスを入力してください";
        }
        if (!values.password) {
            errors.password = "パスワードを入力してください";
        } else if (values.password.length < 6) {
            errors.password = "6文字以上のパスワードを入力してください";
        }

        if (isRegister) {
            if (!values.username) {
                errors.username = "ユーザーネームを入力してください";
            }
            if (!values.confirmPassword) {
                errors.confirmPassword = "パスワード確認を入力してください";
            } else if (values.confirmPassword.length < 6) {
                errors.confirmPassword =
                    "6文字上のパスワードを入力してください";
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
                        <label htmlFor="username" className="font-medium text-sm text-slate-700 mb-1">ユーザー名</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <User size={18} />
                            </div>
                        <input
                            type="text"
                            name="username"
                            placeholder="ユーザー名"
                            value={formValues.username}
                            onChange={(e) => onchangeHandler(e)}
                            className="border-solid border-2 border-gray-100 rounded-md p-1 pl-10 w-full placeholder:text-slate-400"
                        />
                        </div>
                        {formErrors.username && <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>}
                    </div>
                )}
                {formItem.map((item) => (
                    <FormItem
                        key={item.id}
                        item={item}
                        value={formValues[item.id]}
                        icon={item.icon}
                        onchangeHandler={onchangeHandler}
                        error={formErrors[item.id]}
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
                <div>{formErrors.main}</div>
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
