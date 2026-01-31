"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Bell, DoorOpen, SquarePen } from "lucide-react";

const currentUser = {
    id: "taro_1225",
    name: "たろう",
};

const menuList = [
    { name: "投稿一覧", path: "/", icon: Home },
    { name: "通知", path: "/notifications", icon: Bell },
    { name: "設定", path: "/settings", icon: Settings },
];

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <>
            <aside className="hidden lg:flex w-64 bg-purple-50 border-r border-gray-200 h-screen flex-col sticky top-0">
                <div className="text-center border-b border-gray-200">
                    <div className="p-4">
                        <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                            {currentUser.name.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {currentUser.name}
                        </h2>
                        <button className="flex items-center justify-center w-full p-3 bg-purple-600 text-white font-medium rounded-3xl cursor-pointer hover:bg-purple-700 transition-colors">
                            <SquarePen className="w-5 h-5 mr-2" />
                            新規投稿
                        </button>
                    </div>
                </div>

                <nav className="flex-1 border-b border-gray-200">
                    <div className="p-4">
                        <p className="text-gray-600 text-xs font-semibold">
                            メニュー
                        </p>
                        <ul className="mt-4 space-y-3">
                            {menuList.map((menu) => (
                                <li key={menu.path}>
                                    <Link
                                        href={menu.path}
                                        className={`flex items-center p-3 h-10 text-gray-700 font-medium rounded-3xl transition-colors ${
                                            pathname === menu.path
                                                ? "bg-purple-400 text-white"
                                                : "hover:bg-purple-200"
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

                <div className="p-6">
                    <button className="flex items-center justify-center w-full p-3 bg-gray-100 text-gray-700 font-medium rounded-3xl cursor-pointer hover:bg-gray-200 transition-colors">
                        <DoorOpen className="w-5 h-5 mr-2" />
                        ログアウト
                    </button>
                </div>
            </aside>

            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <ul className="flex justify-around items-center h-16">
                    {menuList.map((menu) => (
                        <li key={menu.path} className="flex-1">
                            <Link
                                href={menu.path}
                                className={`flex flex-col items-center justify-center h-full ${pathname === menu.path ? "text-purple-600" : "text-gray-600"}`}
                            >
                                <menu.icon className="w-6 h-6"></menu.icon>
                                <span className="text-sm mt-1">{menu.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};

export default Sidebar;
