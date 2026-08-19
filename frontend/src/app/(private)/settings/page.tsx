"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useUser } from "@/contexts/UserContext";
import { useStatusToast } from "@/hooks/useStatusToast";

import Loading from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/ErrorUI";
import Toast from "@/components/ui/Toast";
import Main from "@/components/ui/PageMain";
import BackButton from "@/components/features/posts/components/shared/BackButton";
import Header from "@/components/features/settings/Header";
import ProfileSection from "@/components/features/settings/ProfileSection";
import NotificationSection from "@/components/features/settings/NotificationSection";
import ThemeSection from "@/components/features/settings/ThemeSection";
import SecuritySection from "@/components/features/settings/SecuritySection";
import Footer from "@/components/features/settings/Footer";

import { NOTIFICATION_OPTIONS, SECURITY_OPTIONS } from "@/constants/settings";

import {
    CheckCircle2,
    Save,
    UserIcon,
    Bell,
    Palette,
    Sun,
    Moon,
    Shield,
    AlertTriangle,
} from "lucide-react";
import { FormValues, Errors } from "@/components/features/settings/types";

const initFormValues = {
    display_name: "",
    email: "",
    description: "",
};

const SettingsPage = () => {
    const { user, isLoading, error, refreshUser } = useUser();
    const searchParams = useSearchParams();
    const [fromProfile, setFromProfile] = useState(false);
    const [profileUserId, setProfileUserId] = useState<string | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAvatarDeleted, setIsAvatarDeleted] = useState(false);

    useEffect(() => {
        if (searchParams.get("from") === "profile") {
            setFromProfile(true);
            setProfileUserId(searchParams.get("userId") || null);
        }
    }, [searchParams]);

    const [showSaveToast, setShowSaveToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        "ネットワークエラーが発生しました。",
    );
    const [isDark, setIsDark] = useState(false);
    const [formValues, setFormValues] = useState<FormValues>(initFormValues);
    const [formErrors, setFormErrors] = useState<Errors>({});

    useEffect(() => {
        if (user) {
            setFormValues({
                display_name: user.display_name || "",
                email: user.email || "",
                description: user.description || "",
            });
        }
    }, [user]);

    const { showToast: showPasswordChangedToast } = useStatusToast(
        "/settings",
        {
            password_changed: { message: "パスワードを変更しました。" },
        },
    );

    const themeOptions = [
        {
            id: "light",
            label: "ライトモード",
            Icon: Sun,
            checked: !isDark,
            className: !isDark ? "text-sky-500" : "text-slate-500",
            btnStyle: !isDark
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-slate-700 bg-slate-800 text-slate-400",
        },
        {
            id: "dark",
            label: "ダークモード",
            Icon: Moon,
            checked: isDark,
            className: isDark ? "text-sky-400" : "text-slate-400",
            btnStyle: isDark
                ? "border-sky-400 bg-slate-900 text-sky-400"
                : "border-slate-300 bg-slate-100 text-slate-400",
        },
    ];

    const saveHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm(formValues);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});

        try {
            const formData = new FormData();
            formData.append("user[display_name]", formValues.display_name);
            formData.append("user[description]", formValues.description || "");

            if (selectedFile) {
                formData.append("user[avatar]", selectedFile);
            } else if (isAvatarDeleted) {
                formData.append("user[remove_avatar]", "true");
            }

            const res = await fetch("/api/users/me", {
                method: "PATCH",
                credentials: "include",
                body: formData,
            });

            if (res.ok) {
                setShowSaveToast(true);
                await refreshUser();
                setSelectedFile(null);
                setIsAvatarDeleted(false);
                setTimeout(() => setShowSaveToast(false), 3000);
            } else {
                console.error("ユーザーデータの更新に失敗:", res.status);

                const errorData = await res.json().catch(() => null);
                setErrorMessage(
                    errorData?.errors
                        ? Object.values(errorData.errors).flat().join(", ")
                        : "ユーザーデータの更新に失敗しました。",
                );

                setShowErrorToast(true);
                setTimeout(() => setShowErrorToast(false), 4000);
            }
        } catch (error) {
            console.error("ユーザーデータの更新中にエラーが発生:", error);
            setErrorMessage("ネットワークエラーが発生しました。");
            setShowErrorToast(true);
            setTimeout(() => setShowErrorToast(false), 4000);
        }
    };

    const validateForm = (values: FormValues) => {
        const errors: Errors = {};

        if (!values.display_name.trim()) {
            errors.display_name = "ユーザー名を入力してください。";
        }

        return errors;
    };

    const changeDarkMode = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.MouseEvent<HTMLButtonElement>,
        isDarkMode: boolean,
    ) => {
        e.preventDefault();
        setIsDark(isDarkMode);
    };

    const onchangeHandler = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { id, value } = e.target;
        setFormValues((prevFormValues) => ({ ...prevFormValues, [id]: value }));
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorUI error={error} fetch={refreshUser} />;
    }

    return (
        <Main padding="p-3 md:p-12">
            <Toast
                showToast={showSaveToast}
                icon={CheckCircle2}
                message="設定を保存しました。"
                bg="bg-emerald-500"
            />
            <Toast
                showToast={showErrorToast}
                icon={AlertTriangle}
                message={errorMessage}
                bg="bg-red-500"
            />
            <Toast
                showToast={showPasswordChangedToast}
                icon={CheckCircle2}
                message="パスワードを変更しました。"
                bg="bg-emerald-500"
            />
            {fromProfile && profileUserId && (
                <div className="mb-6">
                <BackButton
                        fallbackUrl={`/users/${profileUserId}`}
                        label="プロフィールに戻る"
                    />
                </div>
            )}

            <form onSubmit={saveHandler} noValidate>
                <Header icon={Save} saveHandler={saveHandler} />

                <ProfileSection
                    formValues={formValues}
                    formErrors={formErrors}
                    icon={UserIcon}
                    onchangeHandler={onchangeHandler}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    isAvatarDeleted={isAvatarDeleted}
                    setIsAvatarDeleted={setIsAvatarDeleted}
                    currentAvatarUrl={user?.avatar?.url}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NotificationSection
                        notifications={NOTIFICATION_OPTIONS}
                        icon={Bell}
                    />
                    <ThemeSection
                        themeOptions={themeOptions}
                        icon={Palette}
                        changeDarkMode={changeDarkMode}
                    />
                </div>
            </form>

            <SecuritySection
                icon={Shield}
                securityOptions={
                    user?.provider
                        ? SECURITY_OPTIONS.filter(
                              (opt) => opt.id !== "change_password",
                          )
                        : SECURITY_OPTIONS
                }
            />

            <Footer />
        </Main>
    );
};

export default SettingsPage;
