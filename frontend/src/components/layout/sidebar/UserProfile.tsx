import { SquarePen } from "lucide-react";
import Link from "next/link";

const currentUser = {
    id: "taro_1225",
    name: "たろう",
    description: null as string | null,
};

const UserProfile = () => {
    return (
        <div className="text-center border-b border-sidebar-border">
            <div className="p-4">
                <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-primary-foreground font-bold shadow-lg">
                    {currentUser.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-sidebar-foreground mb-1">
                    {currentUser.name}
                </h2>
                {currentUser.description && (
                    <p className="text-sm text-sidebar-foreground/60 mb-4 line-clamp-2">
                        {currentUser.description}
                    </p>
                )}
                {!currentUser.description && <div className="mb-4" />}
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
