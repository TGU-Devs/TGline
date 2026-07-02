import Logo from "./Logo";
import UserProfile from "./UserProfile";
import MenuList from "./MenuList";
import LogoutButton from "./LogoutButton";

import { User } from "@/types/user";
import type { MenuItem } from "./types";

export type DesktopSidebarProps = {
    currentUser: User | null;
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
        <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 h-[calc(100vh-64px)] flex-col sticky top-16 px-4 pb-4 pt-4">
            {/*<UserProfile currentUser={currentUser} isLoading={isLoading} />*/}
            <div className="flex-1">
                <MenuList menuList={menuList} pathname={pathname} />
            </div>
            <LogoutButton isDesktop={true} />
        </aside>
    );
};

export default DesktopSidebar;
