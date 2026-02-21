"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ReturnSettingsBtn from "@/components/features/settings/security/ReturnSettingsBtn";
import SettingSection from "@/components/features/settings/SettingSection";
import SecurityFormItem from "@/components/features/settings/security/SecurityFormItem";
import Button from "@/components/features/settings/security/Button";

import { Lock } from "lucide-react";

import {
    ChangePasswordFormValues,
    ChangePasswordFormItem,
    FormErrors,
} from "@/components/features/settings/security/types";

const formItems: ChangePasswordFormItem[] = [
    {
        id: "current_password",
        label: "現在のパスワード",
        placeholder: "現在のパスワードを入力してください",
    },
    {
        id: "new_password",
        label: "新しいパスワード",
        placeholder: "新しいパスワードを入力してください",
    },
    {
        id: "confirm_new_password",
        label: "新しいパスワード（確認）",
        placeholder: "新しいパスワードを再度入力してください",
    },
];

const initFormValues: ChangePasswordFormValues = {
    current_password: "",
    new_password: "",
    confirm_new_password: "",
};

const ChangePasswordPage = () => {
    const [formValues, setFormValues] =
        useState<ChangePasswordFormValues>(initFormValues);
    const [errors, setErrors] = useState<FormErrors>({});
    
    const router = useRouter();

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormValues((formValues) => ({
            ...formValues,
            [id]: value,
        }));
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;
        const errors = validateForm(formValues);
        setErrors(errors);
        if (Object.keys(errors).length === 0) {
            setIsSubmitting(true);
            try {
                const res = await fetch("/api/users/password", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        password: {
                            current_password: formValues.current_password,
                            new_password: formValues.new_password,
                        },
                    }),
                });

                if (res.ok) {
                    router.push("/settings?status=password_changed");
                } else if (res.status === 401) {
                    setErrors({ current_password: "現在のパスワードが正しくありません" });
                } else {
                    const data = await res.json();
                    setErrors({ new_password: data.errors?.password?.[0] || "パスワードの変更に失敗しました" });
                }
            } catch {
                setErrors({ current_password: "通信エラーが発生しました" });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const validateForm = (values: ChangePasswordFormValues) => {
        const error: FormErrors = {};

        if (!values.current_password) {
            error.current_password = "現在のパスワードを入力してください";
        }

        if (!values.new_password) {
            error.new_password = "新しいパスワードを入力してください";
        } else if (values.new_password.length < 6) {
            error.new_password = "6文字以上のパスワードを入力してください";
        }

        if (!values.confirm_new_password) {
            error.confirm_new_password =
                "新しいパスワード（確認）を入力してください";
        } else if (values.new_password !== values.confirm_new_password) {
            error.confirm_new_password =
                "新しいパスワードと確認用パスワードが一致しません";
        }

        return error;
    };

    return (
        <main className="min-h-screen p-6 max-w-3xl mx-auto">
            <ReturnSettingsBtn />
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SettingSection title="パスワードの変更" icon={Lock}>
                    <p className="text-sm text-slate-500 mb-4">
                        アカウントを安全に保護するため、定期的なパスワードの変更をおすすめします。
                    </p>
                    <form
                        className="space-y-4"
                        onSubmit={onSubmitHandler}
                        noValidate
                    >
                        {formItems.map((item) => {
                            return (
                                <SecurityFormItem
                                    key={item.id}
                                    item={item}
                                    formValues={formValues}
                                    errors={errors}
                                    onChangeHandler={onChangeHandler}
                                />
                            );
                        })}
                        <Button
                            text={isSubmitting ? "変更中..." : "パスワードを変更"}
                            bg="bg-sky-600"
                            hoverBg="hover:bg-sky-700"
                            disabled={isSubmitting}
                        />
                    </form>
                </SettingSection>
            </div>
        </main>
    );
};

export default ChangePasswordPage;
