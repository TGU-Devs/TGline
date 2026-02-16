"use client";

import { useState, useEffect } from "react";

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

const initFormValues = {
    display_name: "",
    email: "",
};

const initUser = {
    display_name: "",
    email: "",
};

const SettingsPage = () => {
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [currentUser, setCurrentUser] = useState(initUser);
    const [formValues, setFormValues] = useState(initFormValues);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch("/api/users/me", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data);
                setFormValues({
                    ...formValues,
                    display_name: data.display_name,
                    email: data.email,
                });
            } else {
                console.error("ユーザーデータの取得に失敗:", res.status);
            }
        };
        fetchUser();
    }, []);

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
                    },
                }),
            });
            if (res.ok) {
                setShowSaveToast(true);
                const updated = await res.json();
                setCurrentUser(updated);
            } else {
                console.error("ユーザーデータの更新に失敗:", res.status);
                setShowErrorToast(true);
            }
        } catch (error) {
            console.error("ユーザーデータの更新中にエラーが発生:", error);
            setShowErrorToast(true);
        } finally {
            setTimeout(() => setShowSaveToast(false), 3000);
            setTimeout(() => setShowErrorToast(false), 4000);
        }
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
        setFormValues({ ...formValues, [id]: value });
    };

    return (
        <main className="min-h-screen bg-sky-100 p-6 md:p-10 duration-300">
            <Toast showToast={showSaveToast} icon={CheckCircle2} message="設定を保存しました。" bg="bg-emerald-500" />
            <Toast showToast={showErrorToast} icon={AlertTriangle} message="エラーが発生しました。" bg="bg-red-500" />

            <form onSubmit={saveHandler}>
                <Header icon={Save} saveHandler={saveHandler} />

                <ProfileSection
                    currentUserName={currentUser.display_name}
                    formValues={formValues}
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

            <SecuritySection icon={Shield} securityOptions={SECURITY_OPTIONS} />

            <Footer />
        </main>
    );
};

export default SettingsPage;
