"use client";

import { useState } from "react";
import { APP_VERSION, APP_TAGLINE } from "@/constants/app";

import {
    CheckCircle2,
    Save,
    UserIcon,
    Bell,
    PcCase,
    Mail,
    Megaphone,
    Palette,
    Sun,
    Moon,
    Shield,
    Lock,
    Trash2,
    ChevronRight,
} from "lucide-react";

const currentUser = {
    id: "taro_1225",
    name: "たろう",
    email: "taro@example.com",
};

const notifications = [
    { id: "desktop", label: "デスクトップ通知", Icon: PcCase, checked: false },
    { id: "email", label: "メール通知", Icon: Mail, checked: false },
    {
        id: "announcement",
        label: "お知らせ通知",
        Icon: Megaphone,
        checked: false,
    },
];

const securityOptions = [
    {
        id: "change_password",
        label: "パスワード変更",
        Icon: Lock,
        changePassword: true,
    },
    {
        id: "delete_account",
        label: "アカウント削除",
        Icon: Trash2,
        changePassword: false,
    },
];

const SettingSection = ({ title, icon: Icon, children }: any) => (
    <section className="rounded-3xl border bg-white border-slate-100 shadow-sm mb-6">
        <header className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                <Icon size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        </header>
        <div className="p-6">{children}</div>
    </section>
);

const SettingsPage = () => {
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [isDarke, setIsDarke] = useState(false);

    const themeOptions = [
        {
            id: "light",
            label: "ライトモード",
            Icon: Sun,
            checked: true,
            className: !isDarke ? "text-sky-500" : "text-slate-500",
            btnStyle: !isDarke
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-slate-700 bg-slate-800 text-slate-400",
        },
        {
            id: "dark",
            label: "ダークモード",
            Icon: Moon,
            checked: false,
            className: isDarke ? "text-sky-400" : "text-slate-400",
            btnStyle: isDarke
                ? "border-sky-400 bg-slate-900 text-sky-400"
                : "border-slate-300 bg-slate-100 text-slate-400",
        },
    ];

    const saveHandler = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
    };
    return (
        <main className="min-h-screen bg-sky-100 p-6 md:p-10 duration-300">
            {showSaveToast && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right ">
                    <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 font-bold">
                        <CheckCircle2 size={20} />
                        <span>設定を保存しました。</span>
                    </div>
                </div>
            )}

            <header className="mb-10 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl text-slate-900 font-bold">設定</h1>
                    <p className="mt-2 text-slate-500">
                        アカウントの管理とアプリケーションのカスタマイズ
                    </p>
                </div>
                <button
                    onClick={saveHandler}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-sky-200 transition-all action:scale-95 flex items-center gap-2 cursor-pointer"
                >
                    <Save size={20} />
                    変更を保存
                </button>
            </header>

            <form>
                <SettingSection title="プロフィール設定" icon={UserIcon}>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-20 h-20 bg-sky-600 rounded-full mb-4 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                            {currentUser.name.charAt(0)}
                        </div>

                        <fieldset className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="space-y-1">
                                <label
                                    htmlFor="username"
                                    className="text-sm font-bold text-slate-400 ml-1"
                                >
                                    ユーザー名
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    defaultValue={currentUser.name}
                                    className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-bold text-slate-400 ml-1"
                                >
                                    メールアドレス
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    defaultValue={currentUser.email}
                                    className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label
                                    htmlFor="bio"
                                    className="text-sm font-bold text-slate-400 ml-1"
                                >
                                    自己紹介
                                </label>
                                <textarea
                                    rows={2}
                                    id="bio"
                                    className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                />
                            </div>
                        </fieldset>
                    </div>
                </SettingSection>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <SettingSection title="通知設定" icon={Bell}>
                            <fieldset disabled>
                                <ul className="space-y-4 opacity-50">
                                    {notifications.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-center justify-between py-1"
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.Icon
                                                    size={18}
                                                    className="text-slate-400"
                                                />
                                                <span className="font-medium text-slate-700">
                                                    {item.label}
                                                </span>
                                            </div>
                                            <label className="relative inline-block w-11 h-6 cursor-not-allowed">
                                                <input
                                                    type="checkbox"
                                                    name={item.id}
                                                    id={item.id}
                                                    defaultChecked={
                                                        item.checked
                                                    }
                                                    disabled
                                                    className="sr-only peer"
                                                />
                                                <span className="absolute inset-0 bg-slate-300 rounded-full transition-colors peer-checked:bg-sky-500"></span>
                                                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </fieldset>
                        </SettingSection>
                        <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                            近日追加予定
                        </div>
                    </div>

                    <div className="relative">
                        <SettingSection title="テーマ" icon={Palette}>
                            <div className="opacity-50">
                                <fieldset disabled className="flex gap-4">
                                    {themeOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            disabled
                                            className={`flex-1 p-9 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-not-allowed ${option.btnStyle}`}
                                        >
                                            <option.Icon
                                            size={24}
                                                className={option.className}
                                            />
                                            <span className="text-sm font-bold text-current">
                                                {option.label}
                                            </span>
                                        </button>
                                    ))}
                                </fieldset>
                            </div>
                        </SettingSection>
                        <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                            近日追加予定
                        </div>
                    </div>
                </div>
            </form>

            <SettingSection title="アカウントとセキュリティ" icon={Shield}>
                <div className="space-y-2">
                    {securityOptions.map((option) => (
                        <button
                            type="button"
                            key={option.id}
                            className="w-full flex items-center justify-between p-4 rounded-xl transition-all group hover:bg-slate-50 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <option.Icon
                                    size={18}
                                    className={
                                        option.changePassword
                                            ? "text-slate-400"
                                            : "text-red-400"
                                    }
                                />
                                <span
                                    className={`font-medium ${option.changePassword ? "text-slate-700" : "text-red-500"}`}
                                >
                                    {option.label}
                                </span>
                            </div>
                            <ChevronRight
                                size={18}
                                className={`text-slate-300 group-hover:translate-x-1 transition-all ${
                                    option.changePassword
                                        ? "group-hover:text-sky-500"
                                        : "group-hover:text-red-500"
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </SettingSection>

            <p className="text-center text-slate-400 text-sm mt-10 mb-20">
                App Version {APP_VERSION} • {APP_TAGLINE}
            </p>
        </main>
    );
};

export default SettingsPage;
