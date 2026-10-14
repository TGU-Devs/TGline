"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useUnreadCount } from "@/components/features/notifications/UnreadCountContext";

import { useMemo } from "react";
import { Home, Settings, Bell, Calendar, MessageSquare, ExternalLink, Shield, BookOpen } from "lucide-react";

import DesktopSidebar from "./DesktopSidebar";
import MobileNav from "./MobileNav";

import type { MenuItem } from "./types";

const baseMenuList: MenuItem[] = [
    { name: "投稿一覧", path: "/posts", icon: Home },
    { name: "授業評価", path: "/courses", icon: BookOpen },
    { name: "通知", path: "/notifications", icon: Bell },
    { name: "TGカレンダー", path: "/calendar", icon: Calendar },
    { name: "外部サイト", path: "/external", icon: ExternalLink },
    { name: "お問い合わせ", path: "/contact", icon: MessageSquare },
    { name: "設定", path: "/settings", icon: Settings },
];

const Sidebar = () => {
    const pathname = usePathname();

    const { user: currentUser, isLoading } = useUser();
    const { unreadCount } = useUnreadCount();

    const menuList = useMemo(() => {
        const items = baseMenuList.map((item) =>
            item.path === "/notifications" ? { ...item, badge: unreadCount } : item,
        );

        if (currentUser?.role === "admin") {
            return [...items, { name: "管理", path: "/admin", icon: Shield }];
        }
        return items;
    }, [currentUser?.role, unreadCount]);

    return (
        <>
            <DesktopSidebar menuList={menuList} pathname={pathname} currentUser={currentUser} isLoading={isLoading} />
            <MobileNav menuList={menuList} pathname={pathname} currentUser={currentUser} isLoading={isLoading} />
        </>
    );
};

export default Sidebar;
