"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Trash } from "lucide-react";

import { useStatusToast } from "@/hooks/useStatusToast";
import { useTags } from "@/components/features/posts/hooks/useTag";

import Loading from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/ErrorUI";
import Toast from "@/components/ui/Toast";
import PostsHeader from "@/components/features/posts/components/list/PostsHeader";
import TagFilter from "@/components/features/posts/components/list/TagFilter";
import EmptyState from "@/components/features/posts/components/list/EmptyState";
import PostList from "@/components/features/posts/components/list/PostList";
import LoginPromptModal from "@/components/features/auth/LoginPromptModal";

import type { Post } from "@/components/features/posts/types";

type FeedTab = "all" | "liked";

export default function PostsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { showToast, message } = useStatusToast("/posts", {
        deleted: { message: "投稿が削除されました。" },
    });

    const { tags, groupedTags } = useTags();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null,
    );
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState<FeedTab>(() =>
        searchParams.get("feed") === "liked" ? "liked" : "all",
    );
    const [selectedTagId, setSelectedTagId] = useState<number | null>(() => {
        const tagId = searchParams.get("tag_id");
        return tagId ? Number(tagId) : null;
    });

    // 選択中のタグを取得
    const selectedTag = tags.find((t) => t.id === selectedTagId);

    const fetchPosts = useCallback(
        async (targetPage: number = 1) => {
            if (activeTab === "liked") {
                if (isAuthenticated === null) {
                    return;
                }

                if (!isAuthenticated) {
                    setShowLoginModal(true);
                    setActiveTab("all");
                    const fallbackParams = new URLSearchParams();
                    if (selectedTagId !== null) {
                        fallbackParams.set("tag_id", String(selectedTagId));
                    }
                    fallbackParams.set("feed", "all");
                    router.replace(`/posts?${fallbackParams.toString()}`, {
                        scroll: false,
                    });
                    return;
                }
            }

            try {
                setError(null);
                if (targetPage === 1) {
                    setIsLoading(true);
                } else {
                    setIsLoadingMore(true);
                }

                const params = new URLSearchParams();
                if (selectedTagId !== null) {
                    params.set("tag_id", String(selectedTagId));
                }
                if (activeTab === "liked") {
                    params.set("liked", "true");
                }
                params.set("page", String(targetPage));

                const res = await fetch(`/api/posts?${params.toString()}`, {
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error("投稿の取得に失敗しました");
                }

                const data = await res.json();
                if (targetPage === 1) {
                    setPosts(data.posts);
                } else {
                    setPosts((prev: Post[]) => [...prev, ...data.posts]);
                }
                setHasMore(data.has_next);
                setPage(targetPage);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "エラーが発生しました",
                );
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [activeTab, isAuthenticated, router, selectedTagId],
    );

    useEffect(() => {
        fetch("/api/users/me", { credentials: "include" })
            .then((res) => setIsAuthenticated(res.ok))
            .catch(() => setIsAuthenticated(false));
    }, []);

    const prevAuthRef = useRef<boolean | null>(null);

    useEffect(() => {
        const authChanged = prevAuthRef.current !== isAuthenticated;
        prevAuthRef.current = isAuthenticated;

        if (activeTab === "all" && authChanged && isAuthenticated !== null) {
            return;
        }

        fetchPosts();
    }, [fetchPosts, activeTab, isAuthenticated]);

    const updateUrlParams = useCallback(
        (nextTagId: number | null, nextFeed: FeedTab) => {
            const params = new URLSearchParams(searchParams.toString());
            if (nextTagId !== null) {
                params.set("tag_id", String(nextTagId));
            } else {
                params.delete("tag_id");
            }
            params.set("feed", nextFeed);
            router.replace(`/posts?${params.toString()}`, { scroll: false });
        },
        [router, searchParams],
    );

    const handleTagSelect = useCallback(
        (tagId: number | null) => {
            setSelectedTagId(tagId);
            setPage(1);
            setHasMore(true);
            setError(null);
            updateUrlParams(tagId, activeTab);
        },
        [activeTab, updateUrlParams],
    );

    const handleFeedTabChange = useCallback(
        (nextTab: FeedTab) => {
            if (nextTab === "liked" && isAuthenticated === false) {
                setShowLoginModal(true);
                return;
            }

            if (nextTab === "liked" && isAuthenticated === null) {
                return;
            }

            setActiveTab(nextTab);
            setPage(1);
            setHasMore(true);
            setError(null);
            updateUrlParams(selectedTagId, nextTab);
        },
        [isAuthenticated, selectedTagId, updateUrlParams],
    );

    const handleLikeToggle = useCallback(
        async (
            e: React.MouseEvent<HTMLButtonElement>,
            postId: number,
            currentLiked: boolean,
        ) => {
            e.preventDefault();
            e.stopPropagation();

            if (isAuthenticated === false) {
                setShowLoginModal(true);
                return;
            }

            if (isAuthenticated === null) {
                // 認証確認中は何もしない
                return;
            }

            const previousPosts = posts;
            const rollbackLike = () => {
                setPosts(previousPosts);
            };

            setPosts((prev) =>
                activeTab === "liked" && currentLiked
                    ? prev.filter((p) => p.id !== postId)
                    : prev.map((p) =>
                          p.id === postId
                              ? {
                                    ...p,
                                    current_user_liked: !currentLiked,
                                    likes_count: currentLiked
                                        ? p.likes_count - 1
                                        : p.likes_count + 1,
                                }
                              : p,
                      ),
            );

            try {
                const res = await fetch(`/api/posts/${postId}/likes`, {
                    method: currentLiked ? "DELETE" : "POST",
                    credentials: "include",
                });

                if (res.status === 401) {
                    setIsAuthenticated(false);
                    setShowLoginModal(true);
                    rollbackLike();
                    return;
                }

                if (!res.ok && res.status !== 201 && res.status !== 204) {
                    rollbackLike();
                }
            } catch {
                rollbackLike();
            }
        },
        [activeTab, isAuthenticated, posts],
    );

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <ErrorUI
                error={error}
                fetch={() => {
                    setError(null);
                    fetchPosts(1);
                }}
            />
        );
    }

    const isLikedFeed = activeTab === "liked";
    const emptyTitle = isLikedFeed
        ? "いいねした投稿がありません"
        : "まだ投稿がありません";
    const emptyDescription = isLikedFeed
        ? "気になる投稿にいいねすると、ここに表示されます"
        : "最初の投稿を作成して、みんなと情報を共有しましょう";

    return (
        <div className="min-h-screen bg-background py-4 sm:py-8">
            <Toast
                showToast={showToast}
                icon={Trash}
                message={message}
                bg="bg-red-500"
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="mb-6 rounded-full bg-slate-200/70 p-1 flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => handleFeedTabChange("all")}
                        className={`flex-1 rounded-full px-4 py-3 text-sm sm:text-base font-semibold transition-colors ${
                            activeTab === "all"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        投稿一覧
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFeedTabChange("liked")}
                        className={`flex-1 rounded-full px-4 py-3 text-sm sm:text-base font-semibold transition-colors ${
                            activeTab === "liked"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        いいねした投稿
                    </button>
                </div>

                <PostsHeader
                    isAuthenticated={!!isAuthenticated}
                    setShowLoginModal={setShowLoginModal}
                    searchParams={searchParams}
                    title={isLikedFeed ? "いいねした投稿" : "投稿一覧"}
                />

                <TagFilter
                    groupedTags={groupedTags}
                    selectedTag={selectedTag}
                    selectedTagId={selectedTagId}
                    onTagSelect={handleTagSelect}
                />

                {posts.length === 0 ? (
                    <EmptyState
                        isAuthenticated={!!isAuthenticated}
                        searchParams={searchParams}
                        setShowLoginModal={setShowLoginModal}
                        title={emptyTitle}
                        description={emptyDescription}
                    />
                ) : (
                    <PostList
                        posts={posts}
                        isAuthenticated={!!isAuthenticated}
                        handleLikeToggle={handleLikeToggle}
                        searchParams={searchParams}
                        setShowLoginModal={setShowLoginModal}
                        hasMore={hasMore}
                        fetchPosts={fetchPosts}
                        page={page}
                        isLoadingMore={isLoadingMore}
                    />
                )}
            </div>
            <LoginPromptModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </div>
    );
}
