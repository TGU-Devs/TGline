import type { LucideIcon } from "lucide-react";

type User = {
    displayName: string;
    email: string;
    bio: string | null;
};

type Notification = {
    id: string;
    label: string;
    Icon: LucideIcon;
    checked: boolean;
};

type ThemeOption = {
    id: string;
    label: string;
    Icon: LucideIcon;
    checked: boolean;
    className: string;
    btnStyle: string;
};

type SecurityOption = {
    id: string;
    label: string;
    Icon: LucideIcon;
    changePassword: boolean;
};

export type {
    User,
    Notification,
    ThemeOption,
    SecurityOption,
};

