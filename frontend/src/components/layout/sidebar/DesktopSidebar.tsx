import { GraduationCap } from "lucide-react";
import UserProfile from "./UserProfile";
import MenuList from "./MenuList";
import LogoutButton from "./LogoutButton";

import type { MenuItem } from "./types";

export type DesktopSidebarProps = {
    menuList: MenuItem[];
    pathname: string;
}

const DesktopSidebar = ({ menuList, pathname }: DesktopSidebarProps) => {
    return(
        <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border h-screen flex-col sticky top-0">
            <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
                <div className="bg-primary text-primary-foreground w-10 h-10 flex items-center justify-center rounded-xl shadow-sm">
                    <GraduationCap size={22} />
                </div>
                <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">TGline</h1>
            </div>
            <UserProfile />
            <MenuList menuList={menuList} pathname={pathname} />
            <LogoutButton />
        </aside>
    );
}

export default DesktopSidebar;
