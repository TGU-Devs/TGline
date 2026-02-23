"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Loading from "@/components/ui/Loading";
import Toast from "@/components/features/settings/Toast";
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

const initUser = {
    display_name: "",
    email: "",
    description: "",
    provider: null as string | null,
};

const SettingsPage = () => {
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [showPasswordChangedToast, setShowPasswordChangedToast] =
        useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);
    const [currentUser, setCurrentUser] = useState(initUser);
    const [formValues, setFormValues] = useState(initFormValues);
    const [formErrors, setFormErrors] = useState<Errors>({});

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/users/me", {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data);
                    setFormValues((prevFormValues) => ({
                        ...prevFormValues,
                        display_name: data.display_name,
                        email: data.email,
                        description: data.description,
                    }));
                }
            } catch (error) {
                console.error("ユーザーデータの取得に失敗:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (searchParams.get("status") === "password_changed") {
            setShowPasswordChangedToast(true);
            router.replace("/settings", { scroll: false });
        }
    }, [searchParams, router]);

    useEffect(() => {
        if (showPasswordChangedToast) {
            const timer = setTimeout(() => {
                setShowPasswordChangedToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showPasswordChangedToast]);

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
            const res = await fetch("/api/users/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    user: {
                        display_name: formValues.display_name,
                        email: formValues.email,
                        description: formValues.description,
                    },
                }),
            });
            if (res.ok) {
                setShowSaveToast(true);
                const updated = await res.json();
                setCurrentUser(updated);
                setTimeout(() => setShowSaveToast(false), 3000);
            } else {
                console.error("ユーザーデータの更新に失敗:", res.status);
                setShowErrorToast(true);
                setTimeout(() => setShowErrorToast(false), 4000);
            }
        } catch (error) {
            console.error("ユーザーデータの更新中にエラーが発生:", error);
            setShowErrorToast(true);
            setTimeout(() => setShowErrorToast(false), 4000);
        }
    };

    const validateForm = (values: FormValues) => {
        const errors: Errors = {};
        const emailRegex =
            /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

        if (!values.display_name.trim()) {
            errors.display_name = "ユーザー名を入力してください。";
        }

        if (!values.email.trim()) {
            errors.email = "メールアドレスを入力してください。";
        } else if (!emailRegex.test(values.email)) {
            errors.email = "正しいメールアドレスを入力してください。";
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

    return (
        <main className="min-h-screen bg-background p-6 md:p-10 duration-300">
            <Toast
                showToast={showSaveToast}
                icon={CheckCircle2}
                message="設定を保存しました。"
                bg="bg-emerald-500"
            />
            <Toast
                showToast={showErrorToast}
                icon={AlertTriangle}
                message="ネットワークエラーが発生しました。"
                bg="bg-red-500"
            />
            <Toast
                showToast={showPasswordChangedToast}
                icon={CheckCircle2}
                message="パスワードを変更しました。"
                bg="bg-emerald-500"
            />

            <form onSubmit={saveHandler} noValidate>
                <Header icon={Save} saveHandler={saveHandler} />

                <ProfileSection
                    currentUserName={currentUser.display_name}
                    formValues={formValues}
                    formErrors={formErrors}
                    icon={UserIcon}
                    onchangeHandler={onchangeHandler}
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
                    currentUser.provider
                        ? SECURITY_OPTIONS.filter(
                              (opt) => opt.id !== "change_password",
                          )
                        : SECURITY_OPTIONS
                }
            />

            <Footer />
        </main>
    );
};

export default SettingsPage;
