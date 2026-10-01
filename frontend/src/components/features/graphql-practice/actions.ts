"use server";

import { revalidatePath } from "next/cache";

import { createStudyPost } from "./posts.graphql";

export type CreatePostActionState = {
    errors: string[];
    message: string | null;
};

export const initialCreatePostActionState: CreatePostActionState = {
    errors: [],
    message: null,
};

export const createPostAction = async (
    _previousState: CreatePostActionState,
    formData: FormData,
): Promise<CreatePostActionState> => {
    const userId = String(formData.get("userId") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();

    if (!userId || !title || !body) {
        return {
            errors: ["userId、title、bodyをすべて入力してください。"],
            message: null,
        };
    }

    try {
        const result = await createStudyPost({ userId, title, body });

        if (result.errors.length > 0) {
            return { errors: result.errors, message: null };
        }

        revalidatePath("/graphql-practice");

        return {
            errors: [],
            message: `投稿「${result.post?.title ?? title}」を作成しました。`,
        };
    } catch (error) {
        return {
            errors: [
                error instanceof Error
                    ? error.message
                    : "Mutationの実行に失敗しました。",
            ],
            message: null,
        };
    }
};
