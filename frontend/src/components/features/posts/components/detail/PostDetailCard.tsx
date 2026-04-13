import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { User, Calendar, Heart, Trash2, Edit } from "lucide-react";

import { useCurrentUser } from "@/components/features/posts/hooks/useCurrentUser";
import  formatDate  from "@/utils/formatDate";

import { linkify } from "@/utils/linkify";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";

import type { Post } from "@/components/features/posts/types";

import { CATEGORY_CONFIG } from "../../constants";

type PostDetailCardProps = {
    post: Post;
    setPost: React.Dispatch<React.SetStateAction<Post | null>>;
};

const PostDetailCard = ({ post, setPost }: PostDetailCardProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { isOwnerOrAdmin } = useCurrentUser();

    const [showPostDeleteModal, setShowPostDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const res = await fetch(`/api/posts/${post.id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("削除に失敗しました");
            }

            router.push(`/posts?status=deleted&${searchParams.toString()}`);
        } catch (err) {
            alert(err instanceof Error ? err.message : "削除に失敗しました");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLikeToggle = async () => {
        if (!post) return;

        const currentLiked = post.current_user_liked;

        // 楽観的 UI 更新
        setPost({
            ...post,
            current_user_liked: !currentLiked,
            likes_count: currentLiked
                ? post.likes_count - 1
                : post.likes_count + 1,
        });

        try {
            const res = await fetch(`/api/posts/${post.id}/likes`, {
                method: currentLiked ? "DELETE" : "POST",
                credentials: "include",
            });

            if (!res.ok && res.status !== 201 && res.status !== 204) {
                // 失敗時にロールバック
                setPost((prev) =>
                    prev
                        ? {
                              ...prev,
                              current_user_liked: currentLiked,
                              likes_count: currentLiked
                                  ? prev.likes_count + 1
                                  : prev.likes_count - 1,
                          }
                        : prev,
                );
            }
        } catch {
            // 失敗時にロールバック
            setPost((prev) =>
                prev
                    ? {
                          ...prev,
                          current_user_liked: currentLiked,
                          likes_count: currentLiked
                              ? prev.likes_count + 1
                              : prev.likes_count - 1,
                      }
                    : prev,
            );
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
            {showPostDeleteModal && (
                <Modal
                    message="投稿"
                    isDeleting={isDeleting}
                    setShowModal={setShowPostDeleteModal}
                    DeleteHandler={handleDelete}
                />
            )}
            {/* ヘッダー */}
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex-1 w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-3 sm:mb-4 wrap-break-words">
                        {post.title}
                    </h1>
                    {/* タグバッジ */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
                            {post.tags.map((tag) => {
                                const categoryConfig = CATEGORY_CONFIG[tag.category as keyof typeof CATEGORY_CONFIG];
                                const badgeClass = categoryConfig?.badge || "bg-slate-100 text-slate-600 border-slate-200";

                                return (
                                    <span
                                        key={tag.id}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${badgeClass}`}
                                    >
                                        {tag.name}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{post.user?.display_name || "匿名"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="break-all">
                                {formatDate(post.created_at)}
                            </span>
                        </div>
                        <button
                            onClick={handleLikeToggle}
                            className="flex items-center gap-1 hover:text-red-500 transition-colors"
                        >
                            <Heart
                                className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                    post.current_user_liked
                                        ? "fill-red-500 text-red-500"
                                        : ""
                                }`}
                            />
                            <span>{post.likes_count}</span>
                        </button>
                    </div>
                </div>
                {isOwnerOrAdmin(post.user?.id) && (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            asChild
                            variant="outline"
                            className="flex-1 sm:flex-initial"
                        >
                            <Link
                                href={`/posts/${post.id}/edit?${searchParams.toString()}`}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">編集</span>
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowPostDeleteModal(true)}
                            disabled={isDeleting}
                            className="flex-1 sm:flex-initial"
                        >
                            <Trash2 className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">
                                {isDeleting ? "削除中..." : "削除"}
                            </span>
                        </Button>
                    </div>
                )}
            </div>

            {/* 本文 */}
            <div className="prose max-w-none">
                <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap wrap-break-words">
                    {linkify(post.body)}
                </p>
            </div>
        </div>
    );
};

export default PostDetailCard;
