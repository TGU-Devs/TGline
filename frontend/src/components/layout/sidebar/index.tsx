"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

import { useMemo } from "react";
import { Home, Settings, Bell, Calendar, MessageSquare, ExternalLink, Shield } from "lucide-react";

import DesktopSidebar from "./DesktopSidebar";
import MobileNav from "./MobileNav";

import type { MenuItem } from "./types";

const baseMenuList: MenuItem[] = [
    { name: "投稿一覧", path: "/posts", icon: Home },
    { name: "通知", path: "/notifications", icon: Bell },
    { name: "TGカレンダー", path: "/calendar", icon: Calendar },
    { name: "外部サイト", path: "/external", icon: ExternalLink },
    { name: "お問い合わせ", path: "/contact", icon: MessageSquare },
    { name: "設定", path: "/settings", icon: Settings },
];

const Sidebar = () => {
    const pathname = usePathname();

    const { user: currentUser, isLoading } = useUser();

    const menuList = useMemo(() => {
        if (currentUser?.role === "admin") {
            return [...baseMenuList, { name: "管理", path: "/admin", icon: Shield }];
        }
        return baseMenuList;
    }, [currentUser?.role]);

    return (
        <>
            <DesktopSidebar menuList={menuList} pathname={pathname} currentUser={currentUser} isLoading={isLoading} />
            <MobileNav menuList={menuList} pathname={pathname} currentUser={currentUser} isLoading={isLoading} />
        </>
    );
};

export default Sidebar;
