import { SquarePen } from "lucide-react";
import Link from "next/link";

const currentUser = {
    id: "taro_1225",
    name: "たろう",
    description: null as string | null,
};

const UserProfile = () => {
    return (
        <div className="border-b border-sidebar-border">
            <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 shrink-0 bg-primary rounded-full flex items-center justify-center text-lg text-primary-foreground font-bold shadow-sm">
                        {currentUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-sidebar-foreground truncate">
                            {currentUser.name}
                        </h2>
                        {currentUser.description && (
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
