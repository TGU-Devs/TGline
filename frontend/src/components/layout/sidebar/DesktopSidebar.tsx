import Logo from "./Logo";
import UserProfile from "./UserProfile";
import MenuList from "./MenuList";
import LogoutButton from "./LogoutButton";

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
            <Logo isDesktop={true} />
            <UserProfile currentUser={currentUser} isLoading={isLoading} />
            <MenuList menuList={menuList} pathname={pathname} />
            <LogoutButton isDesktop={true} />
        </aside>
    );
};

export default DesktopSidebar;
