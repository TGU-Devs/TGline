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
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
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
            const formData = new FormData();
            formData.append("post[title]", title.trim());
            formData.append("post[body]", body.trim());
            if (selectedTagIds.length > 0) {
                selectedTagIds.forEach((tagId) => {
                    formData.append("post[tag_ids][]", String(tagId));
                });
            } else {
                formData.append("post[tag_ids][]", "");
            }
            selectedImages.forEach((image) => {
                formData.append("post[images][]", image);
            });

            const res = await fetch("/api/posts", {
                method: "POST",
                credentials: "include",
                body: formData,
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
                <TopButton backUrl={`/posts?${searchParams.toString()}`} message="一覧に戻る" />

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
                    selectedImages={selectedImages}
                    setSelectedImages={setSelectedImages}
                    isSubmitting={isCreating}
                    cancelUrl={`/posts?${searchParams.toString()}`}
                    formErrors={FormErrors}
                />
            </div>
        </div>
    );
}
