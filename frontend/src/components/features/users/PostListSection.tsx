import type { Post } from "@/components/features/posts/types";
import Link from "next/link";
import {
    ChevronRight,
    MessageCircle,
    Heart,
    Calendar,
    MessagesSquare,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CATEGORY_CONFIG } from "@/components/features/posts/constants";
import type {
    UserComment,
} from "@/components/features/users/types";

type PostListSectionProps = {
    activeTab: "posts" | "comments";
    setActiveTab: (tab: "posts" | "comments") => void;
    posts: Post[];
    comments: UserComment[];
    userId: string;
    postId: string | null;
};

const PostListSection = ({
    activeTab,
    setActiveTab,
    posts,
    comments,
    userId,
    postId,
}: PostListSectionProps) => {
    return (
        <div className="bg-card rounded-3xl p-6 shadow-sm border flex flex-col">
            <div className="flex border-b border-border/50">
                <button
                    onClick={() => setActiveTab("posts")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === "posts"
                            ? "border-blue-500 text-blue-500"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    投稿したスレッド
                </button>
                <button
                    onClick={() => setActiveTab("comments")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === "comments"
                            ? "border-blue-500 text-blue-500"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    コメントしたスレッド
                </button>
            </div>
            <div className="flex-1 mt-6">
                {activeTab === "posts" &&
                    (posts.length > 0 ? (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/posts/${post.id}?from=profile&userId=${userId}${postId ? `&returnPostId=${postId}` : ""}`}
                                    className="block bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-5 hover:shadow-md hover:border-primary/30 transition-all group"
                                >
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <h3 className="text-base sm:text-lg font-semibold text-card-foreground line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>
                                                {new Date(
                                                    post.created_at,
                                                ).toLocaleDateString("ja-JP", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 sm:ml-auto">
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <Heart className="h-4 w-4" />
                                                <span>{post.likes_count}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <MessageCircle className="h-4 w-4" />
                                                <span>
                                                    {post.comments_count}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* タグ情報がある場合 */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {post.tags.map((tag) => {
                                                const config =
                                                    CATEGORY_CONFIG[
                                                        tag.category as keyof typeof CATEGORY_CONFIG
                                                    ];
                                                return (
                                                    <Badge
                                                        key={tag.id}
                                                        variant="outline"
                                                        className={
                                                            config?.badge
                                                        }
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                            <MessagesSquare className="w-10 h-10 opacity-20" />
                            <p className="text-sm">
                                投稿したスレッドはありません。
                            </p>
                        </div>
                    ))}

                {activeTab === "comments" &&
                    (comments.length > 0 ? (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <Link
                                    key={comment.id}
                                    href={`/posts/${comment.post_id}?from=profile&userId=${userId}${postId ? `&returnPostId=${postId}` : ""}`}
                                    className="block bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-5 hover:shadow-md hover:border-primary/30 transition-all group"
                                >
                                    <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between gap-1.5">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span className="font-medium text-slate-600 truncate">
                                                {comment.post_title
                                                    ? `「${comment.post_title}」へのコメント`
                                                    : "スレッドへのコメント"}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                    </div>
                                    <p className="text-sm text-foreground line-clamp-3 mb-3">
                                        {comment.body}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            {new Date(
                                                comment.created_at,
                                            ).toLocaleDateString("ja-JP", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                            <MessageCircle className="w-10 h-10 opacity-20" />
                            <p className="text-sm">
                                コメントしたスレッドはありません。
                            </p>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default PostListSection;
