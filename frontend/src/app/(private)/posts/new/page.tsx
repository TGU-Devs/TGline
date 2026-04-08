"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useFormValidate } from "@/components/features/posts/hooks/useFormValidate";

import TopButton from "@/components/features/posts/components/shared/TopButton";
import Form from "@/components/features/posts/components/form/Form";

export default function PostNewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>(() => {
        const tagId = searchParams.get("tag_id");
        return tagId ? [Number(tagId)] : [];
    });

    const { validateForm, clearErrors, FormErrors } = useFormValidate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isValid = validateForm(title, body);
        if (!isValid) return;

        clearErrors();

        try {
            setIsCreating(true);
            const res = await fetch("/api/posts", {
                method: "POST",
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
                        : "投稿の作成に失敗しました",
                );
            }

            const data = await res.json();
            const params = new URLSearchParams(searchParams.toString());
            params.set("status", "created");
            router.push(`/posts/${data.id}?${params.toString()}`);
        } catch (err) {
            alert(
                err instanceof Error ? err.message : "投稿の作成に失敗しました",
            );
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-4 sm:py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* 戻るボタン */}
                <TopButton searchParams={searchParams} message="一覧に戻る" />

                {/* 新規投稿フォーム */}
                <Form
                    newPost={true}
                    handleSubmit={handleSubmit}
                    title={title}
                    setTitle={setTitle}
                    body={body}
                    setBody={setBody}
                    selectedTagIds={selectedTagIds}
                    setSelectedTagIds={setSelectedTagIds}
                    isSubmitting={isCreating}
                    cancelUrl={`/posts?${searchParams.toString()}`}
                    FormErrors={FormErrors}
                />
            </div>
        </div>
    );
}
