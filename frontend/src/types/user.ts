export type UserAvatar = {
    url: string;
    content_type: string;
    byte_size: number;
}

export type User = {
    id: number;
    display_name: string;
    email: string;
    description?: string;
    provider: string | null;
    role: string;
    avatar: UserAvatar | null;
}