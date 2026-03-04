"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import DeleteAccountModal from "@/components/features/settings/security/DeleteAccountModal";
import ReturnSettingsBtn from "@/components/features/settings/security/ReturnSettingsBtn";
import SettingSection from "@/components/features/settings/SettingSection";
import SecurityFormItem from "@/components/features/settings/security/SecurityFormItem";
import Button from "@/components/features/settings/security/Button";

import Toast from "@/components/ui/Toast";

import { Check, Trash2, TriangleAlert, X } from "lucide-react";

import {
    DeleteAccountFormValues,
    FormErrors,
    DeleteAccountFormItem,
} from "@/components/features/settings/security/types";

const initFormValues: DeleteAccountFormValues = {
    current_password: "",
};

const formItems: DeleteAccountFormItem[] = [
    {
        id: "current_password",
        label: "現在のパスワード",
        placeholder: "現在のパスワードを入力してください",
    },
];

const DeleteAccountPage = () => {
    const [formValues, setFormValues] = useState(initFormValues);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOAuthUser, setIsOAuthUser] = useState(false);
    const [showDeletedToast, setShowDeletedToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/users/me");
                if (res.ok) {
                    const data = await res.json();
                    if (data.provider) {
                        setIsOAuthUser(true);
                    }
                }
            } catch (error) {
                console.error("ユーザー情報取得エラー:", error);
            }
        };
        fetchUser();
    }, []);

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormValues((formValues) => ({
            ...formValues,
            [id]: value,
        }));
    };

    const onSubmitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isOAuthUser) {
            const errors = validateForm(formValues);
            setErrors(errors);
            if (Object.keys(errors).length > 0) return;
        }
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const options: RequestInit = {
                method: "DELETE",
            };

            if (!isOAuthUser) {
                options.headers = { "Content-Type": "application/json" };
                options.body = JSON.stringify({
                    password: {
                        current_password: formValues.current_password,
                    },
                });
            }

            const res = await fetch("/api/users/me", options);

            if (res.status === 204) {
                setIsModalOpen(false);
                setShowDeletedToast(true);
                setTimeout(() => router.push("/"), 1500);
                return;
            }

            const data = await res.json();
            const message = data.error || "アカウント削除に失敗しました";
            setIsModalOpen(false);
            if (isOAuthUser) {
                setErrorMessage(message);
                setShowErrorToast(true);
                setTimeout(() => setShowErrorToast(false), 4000);
            } else {
                setErrors({ current_password: message });
            }
        } catch (error) {
            console.error("削除エラー:", error);
            setIsModalOpen(false);
            if (isOAuthUser) {
                setErrorMessage("アカウント削除に失敗しました");
                setShowErrorToast(true);
                setTimeout(() => setShowErrorToast(false), 4000);
            } else {
                setErrors({ current_password: "アカウント削除に失敗しました" });
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const validateForm = (values: DeleteAccountFormValues): FormErrors => {
        const errors: FormErrors = {};

        if (!values.current_password) {
            errors.current_password = "現在のパスワードを入力してください";
        }

        return errors;
    };

    return (
        <main className="min-h-screen p-6 max-w-3xl mx-auto">
            <Toast
                showToast={showDeletedToast}
                icon={Check}
                message="アカウントが削除されました"
                bg="bg-red-600"
            />
            <Toast
                showToast={showErrorToast}
                icon={X}
                message={errorMessage}
                bg="bg-red-600"
            />
            <DeleteAccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDelete={handleDeleteConfirm}
                isDeleting={isDeleting}
            />
            <ReturnSettingsBtn />
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SettingSection
                    title="アカウント削除"
                    icon={Trash2}
                    iconColor="text-red-600"
                    iconBgColor="bg-red-50"
                    textcolor="text-red-800"
                >
                    <div className="flex items-center gap-3 mb-7 text-red-600 bg-red-50 p-4 rounded-md">
                        <TriangleAlert className="w-10 h-10" />
                        <div>
                            <h2 className="font-bold">警告</h2>
                            <p className="text-sm mt-1">
                                アカウントを削除すると、ログインできなくなり、投稿などのデータにアクセスできなくなります。
                            </p>
                        </div>
                    </div>
                    <form
                        className="space-y-7"
                        onSubmit={onSubmitHandler}
                        noValidate
                    >
                        {!isOAuthUser &&
                            formItems.map((item) => {
                                return (
                                    <SecurityFormItem
                                        key={item.id}
                                        item={item}
                                        formValues={formValues}
                                        errors={errors}
                                        ringColor="focus:ring-red-500"
                                        onChangeHandler={onChangeHandler}
                                    />
                                );
                            })}
                        <Button
                            text="アカウントを削除"
                            bg="bg-red-600"
                            hoverBg="hover:bg-red-700"
                        />
                    </form>
                </SettingSection>
            </div>
        </main>
    );
};

export default DeleteAccountPage;
