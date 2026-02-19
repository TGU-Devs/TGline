"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import SettingSection from "@/components/features/settings/SettingSection";
import ReturnSettingsBtn from "@/components/features/settings/ReturnSettingsBtn";
import SecurityFormItem from "@/components/features/settings/security/SecurityFormItem";

import { Lock } from "lucide-react";

import {
    FormValues,
    FormItem,
    FormErrors,
} from "@/components/features/settings/security/types";

const formItems: FormItem[] = [
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

const initFormValues: FormValues = {
    current_password: "",
    new_password: "",
    confirm_new_password: "",
};

const ChangePasswordPage = () => {
    const [formValues, setFormValues] = useState<FormValues>(initFormValues);
    const [errors, setErrors] = useState<FormErrors>({});

    const router = useRouter();

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormValues((formValues) => ({
            ...formValues,
            [id]: value,
        }));
    };

    const onSubmitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm(formValues);
        setErrors(errors);
        if (Object.keys(errors).length === 0) {
            // バリデーションが成功した場合、API呼び出しのロジックをここに追加

            router.push("/settings?status=password_changed");
        }
    };

    const validateForm = (values: FormValues) => {
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
                        <button
                            type="submit"
                            className="w-full py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors cursor-pointer"
                        >
                            パスワードを変更
                        </button>
                    </form>
                </SettingSection>
            </div>
        </main>
    );
};

export default ChangePasswordPage;
