import Link from "next/link";

import { SquarePen } from "lucide-react";
import Avatar from "boring-avatars";

import { User } from "@/types/user";

type UserProfileProps = {
    currentUser: User | null;
    isLoading: boolean;
};

const UserProfile = ({ currentUser, isLoading }: UserProfileProps) => {
    return (
        <div className="border-b border-sidebar-border">
            <div className="p-4">
                <Link href="/settings" className="flex items-center gap-3 mb-4 rounded-xl p-2 -m-2 hover:bg-sidebar-accent/10 transition-colors">
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
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-sidebar-foreground truncate">
                            {isLoading
                                ? "読み込み中..."
                                : currentUser?.display_name || ""}
                        </h2>
                        {currentUser?.role && (
                            <p className="text-xs text-sidebar-foreground/60 truncate">
                                {currentUser.role}
                            </p>
                        )}
                    </div>
                </Link>
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
