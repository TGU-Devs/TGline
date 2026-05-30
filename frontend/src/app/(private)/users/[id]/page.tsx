"use client";

import { useEffect, useState, use } from "react";
import { User as UserIcon, Calendar, MessagesSquare } from "lucide-react";
import Avatar from "boring-avatars";

import Loading from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/ErrorUI";
import Main from "@/components/ui/PageMain";

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

    return (
        <Main>
            <div className="flex flex-col gap-6">
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

                                <div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
                                        学部・ダミー
                                    </span>
                                </div>

                                <div className="flex items-center text-sm text-muted-foreground gap-1.5 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formattedDate}に登録</span>
                                </div>

                                {user.description && (
                                    <p className="text-sm my-2 text-foreground">
                                        {user.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-8 md:px-8 self-center">
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold">{posts.length}</span>
                                <span className="text-xs text-muted-foreground font-medium mt-1">
                                    投稿
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold">{comments.length}</span>
                                <span className="text-xs text-muted-foreground font-medium mt-1">
                                    コメント
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 投稿一覧 */}
                <div className="bg-card rounded-3xl p-6 shadow-sm border flex flex-col min-h-100">
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
                </div>
            </div>
        </Main>
    );
};

export default UserProfilePage;
