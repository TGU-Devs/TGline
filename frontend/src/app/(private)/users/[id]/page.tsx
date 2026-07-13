"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";

import Loading from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/ErrorUI";
import Main from "@/components/ui/PageMain";
import UserPageHeader from "@/components/features/users/UserPageHeader";
import UserProfileSection from "@/components/features/users/UserProfileSection";
import PostListSection from "@/components/features/users/PostListSection";
import { useUser } from "@/contexts/UserContext";

import type { UserProfile } from "@/components/features/users/types";

const UserProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = use(params);
    const searchParams = useSearchParams();
    const { user: currentUser } = useUser();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");

    const isOwnProfile = currentUser?.id === Number(resolvedParams.id);

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
        return <ErrorUI error={error} fetch={() => window.location.reload()} />;
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

    const posts = user.posts;
    const comments = user.comments;

    const from = searchParams.get("from");
    const postId = searchParams.get("postId");
    const backLabel = from === "posts" ? "一覧に戻る" : "詳細に戻る";
    const backUrl =
        from === "posts" ? "/posts" : postId ? `/posts/${postId}` : "/posts";

    return (
        <Main>
            <div className="flex flex-col gap-6">
                <UserPageHeader
                    backUrl={backUrl}
                    backLabel={backLabel}
                    isOwnProfile={isOwnProfile}
                    userId={resolvedParams.id}
                />

                {/* ユーザープロフィール */}
                <UserProfileSection
                    user={user}
                    formattedDate={formattedDate}
                    posts={posts}
                    comments={comments}
                />

                {/* 投稿一覧 */}
                <PostListSection
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    posts={posts}
                    comments={comments}
                    userId={resolvedParams.id}
                    postId={postId}
                />
            </div>
        </Main>
    );
};

export default UserProfilePage;
