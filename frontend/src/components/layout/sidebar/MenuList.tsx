"use client";

import Link from "next/link";
import type { MenuItem } from "./types";

type MenuListProps = {
    menuList: MenuItem[];
    pathname: string;
};


const MenuList = ({ menuList, pathname }: MenuListProps) => {
    
    return (
        <nav className="flex-1 border-b border-gray-200">
                    <div className="p-4">
                        <p className="text-slate-600 text-xs font-semibold">
                            メニュー
                        </p>
                        <ul className="mt-4 space-y-3">
                            {menuList.map((menu) => (
                                <li key={menu.path}>
                                    <Link
                                        href={menu.path}
                                        className={`flex items-center p-3 h-10 text-slate-800 font-medium rounded-3xl transition-colors ${
                                            pathname === menu.path
                                                ? "bg-sky-400 text-white"
                                                : "hover:bg-sky-200"
                                        }`}
                                    >
                                        <menu.icon className="w-5 h-5 mr-2" />
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