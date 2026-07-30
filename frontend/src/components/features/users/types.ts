import type { Post, Comment } from "@/components/features/posts/types";

export type UserComment = Comment & {
    post_id: number;
    post_title: string | null;
};

export type UserProfile = {
    id: number;
    display_name: string;
    description: string | null;
    created_at: string;
    posts: Post[];
    comments: UserComment[];
};