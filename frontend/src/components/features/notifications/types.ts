type NotificationKind = "like" | "comment";

type Notification = {
    id: number;
    kind: NotificationKind;
    read: boolean;
    message: string;
    actor: { id: number; display_name: string } | null;
    post_id: number | null;
    created_at: string;
};

type FilterTab = "all" | "unread";

type Tab = {
    id: FilterTab;
    label: string;
    count: number;
};

export type { Notification, FilterTab, Tab };