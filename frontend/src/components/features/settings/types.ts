import type { LucideIcon } from "lucide-react";

type SettingsUser = {
    display_name: string;
    email: string;
    description: string;
    provider: string | null;
};

type FormValues = {
    display_name: string;
    email: string;
    description?: string;
};

type Errors = {
    display_name?: string;
    email?: string;
}

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
    SettingsUser,
    FormValues,
    Errors,
    Notification,
    ThemeOption,
    SecurityOption,
};

