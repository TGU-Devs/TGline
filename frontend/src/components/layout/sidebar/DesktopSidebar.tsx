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
        <aside className="hidden lg:flex w-64 bg-purple-50 border-r border-gray-200 h-screen flex-col sticky top-0">
            <UserProfile />
            <MenuList menuList={menuList} pathname={pathname} />
            <LogoutButton />
        </aside>
    );
}

export default DesktopSidebar;