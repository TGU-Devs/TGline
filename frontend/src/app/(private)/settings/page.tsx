"use client";

import { useState } from "react";
import Link from "next/link";

import SaveToast from "@/components/features/settings/SaveToast";
import Header from "@/components/features/settings/Header";
import ProfileSection from "@/components/features/settings/ProfileSection";
import NotificationSection from "@/components/features/settings/NotificationSection";
import ThemeSection from "@/components/features/settings/ThemeSection";
import SecuritySection from "@/components/features/settings/SecuritySection";
import Footer from "@/components/features/settings/Footer";


import { NOTIFICATION_OPTIONS, SECURITY_OPTIONS } from "@/constants/settings";
import type { User } from "@/components/features/settings/types";

import {
    CheckCircle2,
    Save,
    UserIcon,
    Bell,
    Palette,
    Sun,
    Moon,
    Shield,
    MessageCircleQuestion,
} from "lucide-react";

const currentUser: User = {
    displayName: "たろう",
    email: "taro@example.com",
    bio: "こんにちは、たろうです！よろしくお願いします。",
};

const SettingsPage = () => {
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [isDark, setIsDark] = useState(false);

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

    const saveHandler = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
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

    return (
        <main className="min-h-screen bg-sky-100 p-6 md:p-10 duration-300">
            <SaveToast showSaveToast={showSaveToast} icon={CheckCircle2} />

            <form onSubmit={saveHandler}>
                <Header icon={Save} saveHandler={saveHandler} />

                <ProfileSection currentUser={currentUser} icon={UserIcon} />
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

            {/* お問い合わせセクション */}
            <section className="rounded-3xl border bg-white border-slate-100 shadow-sm mb-6">
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                            <MessageCircleQuestion size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">お問い合わせ</h3>
                            <p className="text-sm text-slate-400">
                                バグ報告・機能要望・ご質問など
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/feedback"
                        className="px-5 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all text-sm font-medium"
                    >
                        お問い合わせフォームへ
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default SettingsPage;
