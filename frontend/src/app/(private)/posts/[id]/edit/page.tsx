"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { useFormValidate } from "@/components/features/posts/hooks/useFormValidate";

import Loading from "@/components/ui/Loading";
import ErrorUi from "@/components/features/posts/components/form/Error";
import TopButton from "@/components/features/posts/components/shared/TopButton";
import Form from "@/components/features/posts/components/form/Form";

import type { Post, Tag } from "@/components/features/posts/types";

export default function PostEditPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [post, setPost] = useState<Post | null>(null);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

    const { validateForm, clearErrors, FormErrors } = useFormValidate();

    useEffect(() => {
        if (params.id) {
            fetchPost(params.id as string);
        }
    }, [params.id]);

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
            setTitle(data.title);
            setBody(data.body);
            if (data.tags) {
                setSelectedTagIds(data.tags.map((t: Tag) => t.id));
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "エラーが発生しました",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateForm(title, body);
        if (!isValid) return;

        clearErrors();

        try {
            setIsSaving(true);
            const res = await fetch(`/api/posts/${params.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    post: {
                        title: title.trim(),
                        body: body.trim(),
                        tag_ids: selectedTagIds,
                    },
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData.errors
                        ? Object.values(errorData.errors).flat().join(", ")
                        : "更新に失敗しました",
                );
            }

            const redirectParams = new URLSearchParams(searchParams.toString());
            redirectParams.set("status", "updated");
            router.push(`/posts/${params.id}?${redirectParams.toString()}`);
        } catch (err) {
            alert(err instanceof Error ? err.message : "更新に失敗しました");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error || !post) {
        return <ErrorUi error={error || "投稿が見つかりません"} />;
    }

    return (
        <div className="min-h-screen bg-background py-4 sm:py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* 戻るボタン */}
                <TopButton searchParams={searchParams} message="詳細に戻る" />

                {/* 編集フォーム */}
                <Form
                    newPost={false}
                    handleSubmit={handleSubmit}
                    title={title}
                    setTitle={setTitle}
                    body={body}
                    setBody={setBody}
                    selectedTagIds={selectedTagIds}
                    setSelectedTagIds={setSelectedTagIds}
                    isSubmitting={isSaving}
                    cancelUrl={`/posts/${params.id}?${searchParams.toString()}`}
                    formErrors={FormErrors}
                />
            </div>
        </div>
    );
}
