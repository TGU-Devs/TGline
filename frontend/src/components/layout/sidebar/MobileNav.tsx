import Link from "next/link";
import type { MenuItem } from "./types";

type MobileNavProps = {
    menuList: MenuItem[];
    pathname: string;
}

const MobileNav = ({ menuList, pathname }: MobileNavProps) => {

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
                <ul className="flex justify-around items-center h-16">
                    {menuList.map((menu) => (
                        <li key={menu.path} className="flex-1">
                            <Link
                                href={menu.path}
                                className={`flex flex-col items-center justify-center h-full relative transition-colors ${pathname === menu.path ? "text-sidebar-primary" : "text-muted-foreground"}`}
                            >
                                <menu.icon className="w-6 h-6" />
                                <span className="text-xs mt-1 font-medium">{menu.name}</span>
                                {pathname === menu.path && (
                                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-sidebar-primary" />
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
    );
}

export default MobileNav;