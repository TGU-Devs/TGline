"use client";

import { useActionState } from "react";

import {
    createPostAction,
    initialCreatePostActionState,
} from "./actions";

export default function CreatePostForm() {
    const [state, formAction, isPending] = useActionState(
        createPostAction,
        initialCreatePostActionState,
    );

    return (
        <form action={formAction} className="space-y-4 rounded-lg border p-5">
            <h2 className="text-xl font-semibold">CreatePost Mutation</h2>

            <label className="block space-y-1">
                <span className="text-sm font-medium">User ID</span>
                <input
                    name="userId"
                    defaultValue="1"
                    required
                    className="w-full rounded border px-3 py-2"
                />
            </label>

            <label className="block space-y-1">
                <span className="text-sm font-medium">Title</span>
                <input
                    name="title"
                    required
                    maxLength={100}
                    className="w-full rounded border px-3 py-2"
                />
            </label>

            <label className="block space-y-1">
                <span className="text-sm font-medium">Body</span>
                <textarea
                    name="body"
                    required
                    maxLength={10000}
                    rows={4}
                    className="w-full rounded border px-3 py-2"
                />
            </label>

            <button
                type="submit"
                disabled={isPending}
                className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
                {isPending ? "送信中…" : "Mutationを実行"}
            </button>

            {state.message && (
                <p className="text-sm text-green-700">{state.message}</p>
            )}

            {state.errors.length > 0 && (
                <ul className="list-disc pl-5 text-sm text-red-700">
                    {state.errors.map((error) => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            )}
        </form>
    );
}
