import { useEffect, useState } from "react";
import Link from "next/link";

import { SquarePen } from "lucide-react";
import Avatar from "boring-avatars";

import type { ProfileUser } from "./types";

const initUser: ProfileUser = {
    id: "",
    display_name: "",
    description: "",
};

const UserProfile = () => {
    const [currentUser, setCurrentUser] = useState<ProfileUser>(initUser);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/users/me", {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data);
                }
            } catch (err) {
                console.error("ユーザーデータの取得に失敗:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="border-b border-sidebar-border">
            <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 shrink-0 bg-primary rounded-full flex items-center justify-center text-lg text-primary-foreground font-bold shadow-sm">
                        <Avatar name="Belva Lockwood" colors={["#0a0310","#49007e","#ff005b","#ff7b10","#ffb238"]} variant="beam" size={60}/>
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-sidebar-foreground truncate">
                            {isLoading ? "読み込み中..." : currentUser.display_name}
                        </h2>
                        {currentUser?.description && (
                            <p className="text-xs text-sidebar-foreground/60 truncate">
                                {currentUser.description}
                            </p>
                        )}
                    </div>
                </div>
                <Link
                    href="/posts/new"
                    className="flex items-center justify-center w-full p-3 bg-primary text-primary-foreground font-medium rounded-xl cursor-pointer hover:bg-primary/90 transition-colors"
                >
                    <SquarePen className="w-5 h-5 mr-2" />
                    新規投稿
                </Link>
            </div>
        </div>
    );
};

export default UserProfile;