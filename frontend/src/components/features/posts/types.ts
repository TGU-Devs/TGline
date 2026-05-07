export type Errors = {
    title?: string;
    body?: string;
};

export type Tag = {
    id: number;
    name: string;
    category: "faculty" | "topic";
};

export type Post = {
    id: number;
    title: string;
    body: string;
    user: {
        id: number;
        display_name: string;
    } | null;
    tags: Tag[];
    likes_count: number;
    current_user_liked: boolean;
    comments_count: number;
    images: PostImage[];
    created_at: string;
    updated_at: string;
};

export type PostImage = {
    id: number;
    url: string;
    filename: string;
    content_type: string;
    byte_size: number;
};

export type Comment = {
    id: number;
    body: string;
    user: {
        id: number;
        display_name: string;
    } | null;
    created_at: string;
}

export type CurrentUser = {
    id: number;
    role: string;
}
