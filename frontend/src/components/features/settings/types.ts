import type { LucideIcon } from "lucide-react";

type FormValues = {
    display_name: string;
    email: string;
    description?: string;
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
    link: string;
};

export type {
    FormValues,
    Notification,
    ThemeOption,
    SecurityOption,
};

