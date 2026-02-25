"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Home, Settings, Bell } from "lucide-react";

import DesktopSidebar from "./DesktopSidebar";
import MobileNav from "./MobileNav";

import type { MenuItem, ProfileUser } from "./types";
import { data } from "autoprefixer";

const menuList: MenuItem[] = [
    { name: "投稿一覧", path: "/posts", icon: Home },
    { name: "通知", path: "/notifications", icon: Bell },
    { name: "設定", path: "/settings", icon: Settings },
];

const Sidebar = () => {
    const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const pathname = usePathname();

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
                }
            } catch (err) {
                console.error("ユーザーデータの取得に失敗:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);
    return (
        <>
            <DesktopSidebar menuList={menuList} pathname={pathname} currentUser={currentUser} isLoading={isLoading} />
            <MobileNav menuList={menuList} pathname={pathname} currentUser={currentUser} isLoading={isLoading} />
        </>
    );
};

export default Sidebar;
