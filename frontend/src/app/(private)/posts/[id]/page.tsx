"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import {
    CheckCircle2,
} from "lucide-react";

import { useStatusToast } from "@/hooks/useStatusToast";

import Loading from "@/components/ui/Loading";
import ErrorUi from "@/components/features/posts/components/form/Error";
import Toast from "@/components/ui/Toast";
import TopButton from "@/components/features/posts/components/shared/TopButton";
import PostDetailCard from "@/components/features/posts/components/detail/PostDetailCard";
import CommentSection from "@/components/features/posts/components/detail/CommentSection";

import { Post } from "@/components/features/posts/types";

export default function PostDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchPost(params.id as string);
        }
    }, [params.id]);

    const { showToast, message } = useStatusToast(`/posts/${params.id}`, {
        created: { message: "新しい投稿が作成されました。" },
        updated: { message: "投稿が編集されました。" },
    });


    const fetchPost = async (id: string) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/posts/${id}`, {
                credentials: "include",
            });

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("投稿が見つかりません");
                }
                throw new Error("投稿の取得に失敗しました");
            }

            const data = await res.json();
            setPost(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "エラーが発生しました",
            );
        } finally {
            setIsLoading(false);
        }
    };
    const handleCommentCountChange = (delta: number) => {
        setPost((prev) => prev ? { ...prev, comments_count: prev.comments_count + delta } : prev);
    };

    if (isLoading) {
        return (   
            <Loading />
        );
    }

    if (error || !post) {
        return (
            <ErrorUi
                error={error || "投稿が見つかりませんでした"}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background py-4 sm:py-8">
            {showToast && (
                <Toast
                    showToast={showToast}
                    icon={CheckCircle2}
                    message={message}
                    bg="bg-emerald-500"
                />
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* 戻るボタン */}
                <TopButton searchParams={searchParams} message="一覧に戻る" />

                {/* 投稿カード */}
                <PostDetailCard post={post} setPost={setPost} />

                {/* コメントセクション */}
                <CommentSection
                    postId={post.id}
                    commentsCount={post.comments_count}
                    onCommentCountChange={handleCommentCountChange}
                />
            </div>
        </div>
    );
}
