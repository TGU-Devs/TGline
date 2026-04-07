import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type PostsHeaderProps = {
    isAuthenticated: boolean;
    setShowLoginModal: (show: boolean) => void;
    searchParams: URLSearchParams;
    title?: string;
}

const PostsHeader = ({ isAuthenticated, setShowLoginModal, searchParams, title = "投稿一覧" }: PostsHeaderProps) => {
    return (
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {title}
            </h1>
            {isAuthenticated ? (
                <Button asChild className="w-full sm:w-auto">
                    <Link href={`/posts/new?${searchParams.toString()}`}>
                        <Plus className="h-4 w-4 mr-2" />
                        新規投稿
                    </Link>
                </Button>
            ) : (
                <Button
                    className="w-full sm:w-auto"
                    onClick={() => setShowLoginModal(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    新規投稿
                </Button>
            )}
        </div>
    );
};

export default PostsHeader;
