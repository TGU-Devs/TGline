"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

import { Home, Settings, Bell } from "lucide-react";

import DesktopSidebar from "./DesktopSidebar";
import MobileNav from "./MobileNav";

import type { MenuItem } from "./types";

const menuList: MenuItem[] = [
    { name: "投稿一覧", path: "/posts", icon: Home },
    { name: "通知", path: "/notifications", icon: Bell },
    { name: "設定", path: "/settings", icon: Settings },
];

const Sidebar = () => {
    const pathname = usePathname();

    const { user: currentUser, isLoading } = useUser();

    return (
        <>
            <DesktopSidebar menuList={menuList} pathname={pathname} currentUser={currentUser} isLoading={isLoading} />
            <MobileNav menuList={menuList} pathname={pathname} currentUser={currentUser} isLoading={isLoading} />
        </>
    );
};

export default Sidebar;
