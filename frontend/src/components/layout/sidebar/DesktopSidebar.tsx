import Image from "next/image";
import UserProfile from "./UserProfile";
import MenuList from "./MenuList";
import LogoutButton from "./LogoutButton";
import { outfit } from "@/lib/fonts";

import type { MenuItem, ProfileUser } from "./types";

export type DesktopSidebarProps = {
    currentUser: ProfileUser | null;
    isLoading: boolean;
    menuList: MenuItem[];
    pathname: string;
};

const DesktopSidebar = ({
    menuList,
    pathname,
    currentUser,
    isLoading,
}: DesktopSidebarProps) => {
    return (
        <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border h-screen flex-col sticky top-0">
            <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
                <div className="w-10 h-10 shrink-0 shadow-sm rounded-xl overflow-hidden bg-background">
                    <Image
                        src="/TGlinelogo.svg"
                        alt="TGline"
                        width={40}
                        height={40}
                        className="w-full h-full mix-blend-multiply"
                    />
                </div>
                <h1
                    className={`text-lg font-bold text-sidebar-foreground tracking-tight ${outfit.className}`}
                >
                    T G l i n e
                </h1>
            </div>
            <UserProfile currentUser={currentUser} isLoading={isLoading} />
            <MenuList menuList={menuList} pathname={pathname} />
            <LogoutButton isDesktop={true} />
        </aside>
    );
};

export default DesktopSidebar;
