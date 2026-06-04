"use client";

import { useEffect, useState, use } from "react";
import { User as UserIcon, Calendar, MessagesSquare } from "lucide-react";
import Link from "next/link";
import Avatar from "boring-avatars";
import { ChevronRight, MessageCircle, Heart } from "lucide-react";

import BackButton from "@/components/features/posts/components/shared/BackButton";
import Loading from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/ErrorUI";
import Main from "@/components/ui/PageMain";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_CONFIG } from "@/components/features/posts/constants";

import type { Post, Comment } from "@/components/features/posts/types";

type UserProfile = {
    id: number;
    display_name: string;
    description: string | null;
    created_at: string;
    posts: Post[];
    comments: Comment[];
};

const UserProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = use(params);

    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/users/${resolvedParams.id}`);

                if (!response.ok) {
                    throw new Error("ユーザー情報の取得に失敗しました");
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "ユーザー情報の取得中にエラーが発生しました",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [resolvedParams.id]);

    if (isLoading) {
        return <Loading />;
    }
    if (error) {
        if (error)
            return (
                <ErrorUI error={error} fetch={() => window.location.reload()} />
            );
    }
    if (!user) {
        return (
            <ErrorUI
                error="ユーザーが見つかりませんでした"
                fetch={() => window.location.reload()}
            />
        );
    }

    const formattedDate = new Date(user.created_at).toLocaleDateString(
        "ja-JP",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
        },
    );

    const posts: Post[] = user.posts;
    const comments: Comment[] = user.comments;

    const from = new URLSearchParams(window.location.search).get("from");
    const backLabel = from === "posts" ? "一覧に戻る" : "詳細に戻る";

    return (
        <Main>
            <div className="flex flex-col gap-6">
                <div>
                    <BackButton
                        fallbackUrl={
                            from === "profile" ? "/users/[id]" : "/posts"
                        }
                        label={backLabel}
                    />
                </div>

                {/* ユーザープロフィール */}
                <div className="bg-card rounded-3xl p-6 shadow-sm border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-6">
                            <div className="shrink-0 flex items-center justify-center rounded-full bg-blue-50/50 p-2">
                                <Avatar
                                    name={user.display_name}
                                    variant="beam"
                                    size={80}
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-0.5">
                                    <h1 className="text-xl font-bold">
                                        {user.display_name}
                                    </h1>
                                </div>

                                {/* 学部情報 */}
                                {/* <div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
                                        学部・ダミー
                                    </span>
                                </div> */}

                                <div className="flex items-center text-sm text-muted-foreground gap-1.5 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formattedDate}に登録</span>
                                </div>

                                {user.description ? (
                                    <p className="text-sm my-2 text-foreground">
                                        {user.description}
                                    </p>
                                ) : (
                                    <p className="text-sm my-2 text-foreground/70 italic">
                                        自己紹介がありません。
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-8 md:px-8 self-center">
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold">
                                    {posts.length}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium mt-1">
                                    投稿
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold">
                                    {comments.length}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium mt-1">
                                    コメント
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 投稿一覧 */}
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
                                            href={`/posts/${post.id}?from=profile`}
                                            className="block bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-5 hover:shadow-md hover:border-primary/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                <h3 className="text-base sm:text-lg font-semibold text-card-foreground line-clamp-2">
                                                    {post.title}
                                                </h3>
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 bg-primary/15 rounded-full flex items-center justify-center">
                                                        <UserIcon className="h-3 w-3 text-primary" />
                                                    </div>
                                                    <span>
                                                        {user.display_name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>
                                                        {new Date(
                                                            post.created_at,
                                                        ).toLocaleDateString(
                                                            "ja-JP",
                                                            {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 sm:ml-auto">
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <Heart className="h-4 w-4" />
                                                        <span>
                                                            {post.likes_count}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                post.comments_count
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* タグ情報がある場合 */}
                                            {post.tags &&
                                                post.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {post.tags.map(
                                                            (tag) => {
                                                                const config =
                                                                    CATEGORY_CONFIG[
                                                                        tag.category as keyof typeof CATEGORY_CONFIG
                                                                    ];
                                                                return (
                                                                    <Badge
                                                                        key={
                                                                            tag.id
                                                                        }
                                                                        variant="outline"
                                                                        className={
                                                                            config?.badge
                                                                        }
                                                                    >
                                                                        {
                                                                            tag.name
                                                                        }
                                                                    </Badge>
                                                                );
                                                            },
                                                        )}
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
                                            href={`/posts/${(comment as any).post_id}?from=profile`}
                                            className="block bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-5 hover:shadow-md hover:border-primary/30 transition-all group"
                                        >
                                            <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="font-medium text-slate-600 truncate">
                                                        {(comment as any)
                                                            .post_title
                                                            ? `「${(comment as any).post_title}」へのコメント`
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
                                                    ).toLocaleDateString(
                                                        "ja-JP",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )}
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
            </div>
        </Main>
    );
};

export default UserProfilePage;
