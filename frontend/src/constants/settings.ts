import { PcCase, Mail, Megaphone, Lock, Trash2 } from "lucide-react";

const NOTIFICATION_OPTIONS = [
    { id: "desktop", label: "デスクトップ通知", Icon: PcCase, checked: false },
    { id: "email", label: "メール通知", Icon: Mail, checked: false },
    {
        id: "announcement",
        label: "お知らせ通知",
        Icon: Megaphone,
        checked: false,
    },
];

const SECURITY_OPTIONS = [
    {
        id: "change_password",
        label: "パスワード変更",
        Icon: Lock,
        changePassword: true,
        link: "/settings/security/change-password",
    },
    {
        id: "delete_account",
        label: "アカウント削除",
        Icon: Trash2,
        changePassword: false,
        link: "/settings/security/delete-account",
    },
];

export { NOTIFICATION_OPTIONS, SECURITY_OPTIONS };