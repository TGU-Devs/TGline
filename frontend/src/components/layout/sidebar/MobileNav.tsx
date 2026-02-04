import Link from "next/link";
import type { MenuItem } from "./types";

type MobileNavProps = {
    menuList: MenuItem[];
    pathname: string;
}

const MobileNav = ({ menuList, pathname }: MobileNavProps) => {

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <ul className="flex justify-around items-center h-16">
                    {menuList.map((menu) => (
                        <li key={menu.path} className="flex-1">
                            <Link
                                href={menu.path}
                                className={`flex flex-col items-center justify-center h-full ${pathname === menu.path ? "text-sky-600" : "text-gray-600"}`}
                            >
                                <menu.icon className="w-6 h-6" />
                                <span className="text-sm mt-1">{menu.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
    );
}

export default MobileNav;