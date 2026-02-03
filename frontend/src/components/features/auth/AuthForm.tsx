"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormItem from "./FormItem";

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
};

const formItem: FormItemType[] = [
    {
        id: "email",
        label: "メールアドレス",
        type: "email",
    },
    {
        id: "password",
        label: "パスワード",
        type: "password",
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

    const submitHandler = async(e: FormEvent<HTMLFormElement>) => {
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
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type' : 'application/json' },
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
                        setFormErrors({ main: '登録に失敗しました' });
                    }
                    return;
                }

                router.push('/login');
            } else {
                //ログイン処理
            }
        } catch (error) {
            console.error('AuthForm error:', error);
            setFormErrors({ main: 'サーバーエラーが発生しました' });
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
        <div>
            <form onSubmit={(e) => submitHandler(e)}>
                <h1>{isRegister ? "新規登録" : "ログイン"}</h1>
                {isRegister && (
                    <div>
                        <label htmlFor="username">ユーザー名</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="ユーザー名"
                            value={formValues.username}
                            onChange={(e) => onchangeHandler(e)}
                        />
                        {formErrors.username && <p>{formErrors.username}</p>}
                    </div>
                )}
                {formItem.map((item) => (
                    <FormItem
                        key={item.id}
                        item={item}
                        value={formValues[item.id]}
                        onchangeHandler={onchangeHandler}
                        error={formErrors[item.id]}
                    />
                ))}
                {isRegister && (
                    <div>
                        <label htmlFor="confirmPassword">
                            パスワード確認用
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="パスワード確認用"
                            value={formValues.confirmPassword}
                            onChange={(e) => onchangeHandler(e)}
                        />
                        {formErrors.confirmPassword && (
                            <p>{formErrors.confirmPassword}</p>
                        )}
                    </div>
                )}
                <div>{formErrors.main}</div>
                <button>{isLoading ? '処理中...' : isRegister ? "登録" : "ログイン"}</button>
                <div>
                    <p>
                        {isRegister
                            ? "すでにアカウントをお持ちの方は"
                            : "新規登録は"}
                    </p>
                    <Link href={isRegister ? "/login" : "/register"}>
                        こちら
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AuthForm;
