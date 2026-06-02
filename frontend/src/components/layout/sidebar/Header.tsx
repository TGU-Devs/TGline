"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, ChevronDown } from "lucide-react";
import Avatar from "boring-avatars";
import { User } from "@/types/user";
import Logo from "@/components/layout/sidebar/Logo";

type HeaderProps = {
    currentUser: User | null;
    isLoading: boolean;
};

const Header = ({ currentUser, isLoading }: HeaderProps) => {
    // ポップアップの開閉状態を管理
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="hidden lg:flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-8 sticky top-0 z-50">
            <div className="flex items-center">
                <Logo isDesktop={false} href="/" />
            </div>
            
            <div id="header-user-actions" className="relative flex items-center gap-6">
                
                <div ref={dropdownRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="relative flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
                        aria-label="Open notifications"
                    >
                        <Bell className="w-6 h-6" />
                    </button>

                    {/* ベルマークを押したときに出るポップアップ */}
                    {isNotificationOpen && (
                        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl z-50">
                            {/* ヘッダー部分 */}
                            <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                                <span className="font-bold text-gray-800 text-sm">通知</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log("すべての通知を既読にしました");
                                    }}
                                    className="text-xs font-semibold text-blue-500 hover:underline cursor-pointer"
                                >
                                    すべて既読にする
                                </button>
                            </div>

                            <div className="py-6 text-center">
                                <p className="text-xs text-gray-400 font-medium">
                                    通知機能は準備中です
                                </p>
                            </div>
                            <div className="pt-2 text-center border-t border-gray-50">
                                <Link 
                                    href="/notifications" 
                                    onClick={() => setIsNotificationOpen(false)} // ★ クリックしたら閉じる
                                    className="text-xs font-bold text-blue-500 hover:underline block w-full py-1"
                                >
                                    すべての通知を見る
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* ユーザープロフィール */}
                <Link href="/settings" className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 shrink-0 bg-primary rounded-full flex items-center justify-center text-lg text-primary-foreground font-bold shadow-sm overflow-hidden">
                        {currentUser ? (
                            <Avatar name={currentUser?.display_name || ""} variant="beam" size={36} />
                        ) : (
                            <div className="animate-pulse w-9 h-9 bg-primary/50 rounded-full" />
                        )}
                    </div>

                    <div className="text-left flex items-center gap-2">
                        <div>
                            <p className="text-sm font-bold text-gray-800 leading-none">
                                {isLoading ? "読み込み中..." : currentUser?.display_name || "ゲストユーザー"}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1 leading-none">
                                {isLoading ? "" : currentUser?.role || "user"}
                            </p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                    </div>
                </Link>

            </div>
        </header>
    );
};

export default Header;