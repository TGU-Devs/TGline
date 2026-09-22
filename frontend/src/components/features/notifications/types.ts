import type { UserAvatar } from "@/types/user";

type NotificationType = "like" | "comment";

type Notification = {
    id: number;
    type: NotificationType;
    read: boolean;
    actor: { id: number; display_name: string; avatar: UserAvatar | null } | null;
    post: { id: number; title: string } | null;
    created_at: string;
};

type FilterTab = "all" | "unread";

type Tab = {
    id: FilterTab;
    label: string;
    count: number;
};

export type { Notification, FilterTab, Tab };
