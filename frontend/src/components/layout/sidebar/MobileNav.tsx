import { useEffect, useState } from "react";
import Link from "next/link";

import Logo from "./Logo";
import LogoutButton from "./LogoutButton";

import { Menu, X } from "lucide-react";
import Avatar from "boring-avatars";

import { User } from "@/types/user";
import type { MenuItem } from "./types";

import { APP_COPYRIGHT, APP_VERSION } from "@/constants/app";

type MobileNavProps = {
    currentUser: User | null;
    isLoading: boolean;
    menuList: MenuItem[];
    pathname: string;
};

const MobileNav = ({
    menuList,
    pathname,
    currentUser,
    isLoading,
}: MobileNavProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    return (
        <div className="lg:hidden">
            <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar px-3 shadow-sm">
                <Logo isDesktop={false} />

                {currentUser && (
                    <button
                        onClick={toggleMenu}
                        className="p-2  rounded-md transition-colors active:scale-90"
                        aria-label="Toggle Menu"
                        aria-controls="mobile-nav-menu"
                        aria-expanded={isMenuOpen}
                    >
                        <Menu size={28} />
                    </button>
                )}
            </header>

            <div
                className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={toggleMenu}
            />

            <aside
                id="mobile-nav-menu"
                className={`fixed top-0 right-0 z-50 flex flex-col w-72 h-full bg-background shadow-2xl transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                        Menu
                    </span>
                    <button
                        onClick={toggleMenu}
                        className="p-1 hover:bg-sidebar-border"
                        aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
                        aria-controls="mobile-nav-menu"
                    >
                        <X size={20} />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 border-b border-sidebar-border">
                        {menuList.map((menu) => (
                            <li key={menu.path} className="flex-1">
                                <Link
                                    href={menu.path}
                                    onClick={toggleMenu}
                                    className={`flex items-center px-6 py-4 transition-colors ${pathname === menu.path ? "text-sidebar-primary" : "text-muted-foreground"}`}
                                >
                                    <menu.icon className="mr-4" />
                                    <span className="text-xs mt-1 font-medium">
                                        {menu.name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <LogoutButton isDesktop={false} />
                </nav>

                <div className="p-6 border-t border-sidebar-border">
                    <Link href="/settings" onClick={toggleMenu} className="flex items-center space-x-3 mb-4 rounded-xl p-2 -m-2 hover:bg-sidebar-accent/10 transition-colors">
                        <div className="w-10 h-10 shrink-0 bg-primary rounded-full flex items-center justify-center text-lg text-primary-foreground font-bold shadow-sm">
                            {currentUser ? (
                                <Avatar
                                    name={currentUser?.display_name || ""}
                                    variant="beam"
                                    size={60}
                                />
                            ) : (
                                <div className="animate-pulse w-10 h-10 bg-primary/50 rounded-full" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-sidebar-foreground truncate">
                                {isLoading
                                    ? "読み込み中..."
                                    : currentUser?.display_name || ""}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {currentUser?.role || ""}
                            </p>
                        </div>
                    </Link>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                        {APP_COPYRIGHT} v{APP_VERSION}
                    </p>
                </div>
            </aside>
        </div>
    );
};

export default MobileNav;
