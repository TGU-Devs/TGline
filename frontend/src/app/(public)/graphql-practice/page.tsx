import { notFound } from "next/navigation";

import CreatePostForm from "@/components/features/graphql-practice/CreatePostForm";
import { getStudyPosts } from "@/components/features/graphql-practice/posts.graphql";

export const dynamic = "force-dynamic";

export default async function GraphqlPracticePage() {
    if (process.env.NODE_ENV !== "development") {
        notFound();
    }

    const posts = await getStudyPosts({ limit: 20 });

    return (
        <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
            <header className="space-y-2">
                <p className="text-sm text-gray-500">Development only</p>
                <h1 className="text-3xl font-bold">GraphQL Practice</h1>
                <p className="text-gray-700">
                    Server ComponentのQueryと、Server
                    Action経由のMutationを確認する学習画面です。
                </p>
            </header>

            <CreatePostForm />

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">GetStudyPosts Query</h2>

                {posts.length === 0 ? (
                    <p className="text-gray-500">投稿はありません。</p>
                ) : (
                    <ul className="space-y-3">
                        {posts.map((post) => (
                            <li key={post.id} className="rounded-lg border p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="font-semibold">{post.title}</h3>
                                    <span className="text-xs text-gray-500">
                                        Post ID: {post.id}
                                    </span>
                                </div>
                                <p className="mt-2 whitespace-pre-wrap">{post.body}</p>
                                <p className="mt-3 text-sm text-gray-500">
                                    User: {post.user.displayName} (ID: {post.user.id})
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
