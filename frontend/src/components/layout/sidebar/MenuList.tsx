"use client";

import Link from "next/link";
import type { MenuItem } from "./types";

type MenuListProps = {
    menuList: MenuItem[];
    pathname: string;
};


const MenuList = ({ menuList, pathname }: MenuListProps) => {

    return (
        <nav className="flex-1 border-b border-sidebar-border">
                    <div className="p-4">
                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                            メニュー
                        </p>
                        <ul className="mt-4 space-y-1">
                            {menuList.map((menu) => (
                                <li key={menu.path}>
                                    <Link
                                        href={menu.path}
                                        className={`flex items-center p-3 h-10 font-medium rounded-xl transition-colors ${
                                            pathname === menu.path
                                                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                                : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                                        }`}
                                    >
                                        <menu.icon className="w-5 h-5 mr-3" />
                                        {menu.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
    );
}
export default MenuList;
