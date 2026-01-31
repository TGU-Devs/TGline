"use client";

import { usePathname } from "next/navigation";
import { Home, Settings, Bell } from "lucide-react";

import DesktopSidebar from "./DesktopSidebar";
import MobileNav from "./MobileNav";

import type { MenuItem } from "./types";

const menuList: MenuItem[] = [
    { name: "投稿一覧", path: "/", icon: Home },
    { name: "通知", path: "/notifications", icon: Bell },
    { name: "設定", path: "/settings", icon: Settings },
];

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <>
            <DesktopSidebar menuList={menuList} pathname={pathname} />
            <MobileNav menuList={menuList} pathname={pathname} />
        </>
    );
};

export default Sidebar;
