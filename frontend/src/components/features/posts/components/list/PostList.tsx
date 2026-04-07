import Link from "next/link";
import { User, Calendar, Heart, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { CATEGORY_CONFIG } from "../../constants";

import type { Post } from "../../types";

type PostListProps = {
    posts: Post[];
    isAuthenticated: boolean;
    handleLikeToggle: (
        e: React.MouseEvent<HTMLButtonElement>,
        postId: number,
        isLiked: boolean,
    ) => void;
    searchParams: URLSearchParams;
    setShowLoginModal: (show: boolean) => void;
    hasMore: boolean;
    fetchPosts: (page: number) => void;
    page: number;
    isLoadingMore: boolean;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const PostList = ({
    posts,
    isAuthenticated,
    handleLikeToggle,
    searchParams,
    setShowLoginModal,
    hasMore,
    fetchPosts,
    page,
    isLoadingMore,
}: PostListProps) => {
    return (
        <div className="space-y-4">
            {posts.map((post) => {
                const cardContent = (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 hover:shadow-md hover:border-primary/30 transition-all">
                        <h2 className="text-lg sm:text-xl font-semibold text-card-foreground mb-2 sm:mb-3 line-clamp-2">
                            {post.title}
                        </h2>
                        {/* タグバッジ */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
                                {post.tags.map((tag) => {
                                    const config =
                                        CATEGORY_CONFIG[
                                            tag.category as keyof typeof CATEGORY_CONFIG
                                        ];
                                    return (
                                        <Badge
                                            key={tag.id}
                                            variant="outline"
                                            className={config?.badge}
                                        >
                                            {tag.name}
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 bg-primary/15 rounded-full flex items-center justify-center">
                                    <User className="h-3 w-3 text-primary" />
                                </div>
                                <span>{post.user?.display_name || "匿名"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="break-all">
                                    {formatDate(post.created_at)}
                                </span>
                            </div>
                            <button
                                onClick={(e) =>
                                    handleLikeToggle(
                                        e,
                                        post.id,
                                        post.current_user_liked,
                                    )
                                }
                                className="flex items-center gap-1 hover:text-red-500 transition-colors"
                            >
                                <Heart
                                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                                        post.current_user_liked
                                            ? "fill-red-500 text-red-500"
                                            : ""
                                    }`}
                                />
                                <span>{post.likes_count}</span>
                            </button>
                            <div className="flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span>{post.comments_count}</span>
                            </div>
                        </div>
                    </div>
                );

                return isAuthenticated ? (
                    <Link
                        key={post.id}
                        href={`/posts/${post.id}?${searchParams.toString()}`}
                        className="block"
                    >
                        {cardContent}
                    </Link>
                ) : (
                    <div
                        key={post.id}
                        className="block cursor-pointer"
                        onClick={() => setShowLoginModal(true)}
                    >
                        {cardContent}
                    </div>
                );
            })}
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        onClick={() => fetchPosts(page + 1)}
                        disabled={isLoadingMore}
                    >
                        {isLoadingMore ? "読み込み中..." : "もっと読む"}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PostList;