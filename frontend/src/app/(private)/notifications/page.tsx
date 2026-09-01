"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
    Bell,
    BellOff,
    CheckCheck,
    ChevronRight,
    Heart,
    MessageCircle,
} from "lucide-react";

import Main from "@/components/ui/PageMain";
import Loading from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/ErrorUI";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import formatDate from "@/utils/formatDate";

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

const KIND_CONFIG = {
    like: {
        label: "いいね",
        Icon: Heart,
        badge: "bg-rose-500",
        chip: "bg-rose-50 text-rose-600",
    },
    comment: {
        label: "コメント",
        Icon: MessageCircle,
        badge: "bg-sky-500",
        chip: "bg-sky-50 text-sky-600",
    },
} as const;

// マウント後に基準時刻が決まるまでは絶対表記（SSRとのズレを避ける）
const relativeTime = (isoString: string, now: number | null) => {
    if (now === null) return formatDate(isoString);

    const diffMinutes = Math.floor(
        (now - new Date(isoString).getTime()) / 60000,
    );

    if (diffMinutes < 1) return "たった今";
    if (diffMinutes < 60) return `${diffMinutes}分前`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}時間前`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}日前`;

    return formatDate(isoString);
};

const NotificationsPage = () => {
    const router = useRouter();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [now, setNow] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 基準時刻を設定
    useEffect(() => {
        setNow(Date.now());
    }, []);

    // 通知を取得
    const fetchNotifications = useCallback(async (targetPage: number) => {
        try {
            setError(null);
            if (targetPage === 1) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            const res = await apiFetch(`/api/notifications?page=${targetPage}`);
            if (!res.ok) {
                throw new Error("通知の取得に失敗しました");
            }

            const data = await res.json();
            if (targetPage === 1) {
                setNotifications(data.notifications);
            } else {
                setNotifications((prev) => [...prev, ...data.notifications]);
            }
            setHasNextPage(Boolean(data.has_next_page));
            setPage(targetPage);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "エラーが発生しました",
            );
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    // 未読通知の数を取得
    const unreadCount = useMemo(
        () => notifications.filter((notification) => !notification.read).length,
        [notifications],
    );

    // 表示する通知を取得
    const visibleNotifications = useMemo(
        () =>
            activeTab === "unread"
                ? notifications.filter((notification) => !notification.read)
                : notifications,
        [notifications, activeTab],
    );

    // 通知を既読にする
    const markAsRead = async (id: number) => {
        const target = notifications.find((notification) => notification.id === id);
        if (!target || target.read) return;

        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification,
            ),
        );

        try {
            const res = await apiFetch(`/api/notifications/${id}/read`, {
                method: "POST",
            });
            if (!res.ok) {
                throw new Error("既読にできませんでした");
            }
        } catch {
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id
                        ? { ...notification, read: false }
                        : notification,
                ),
            );
        }
    };

    // すべての通知を既読にする
    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        const previous = notifications;
        setNotifications((prev) =>
            prev.map((notification) => ({ ...notification, read: true })),
        );

        try {
            const res = await apiFetch("/api/notifications/read_all", {
                method: "POST",
            });
            if (!res.ok) {
                throw new Error("すべて既読にできませんでした");
            }
        } catch {
            setNotifications(previous);
        }
    };

    // 通知をクリックしたときの処理
    const clickHandler = async (notification: Notification) => {
        await markAsRead(notification.id);

        if (notification.post_id) {
            router.push(`/posts/${notification.post_id}`);
        }
    };

    const tabs: { id: FilterTab; label: string; count: number }[] = [
        { id: "all", label: "すべて", count: notifications.length },
        { id: "unread", label: "未読", count: unreadCount },
    ];

    if (isLoading) {
        return <Loading />;
    }

    if (error && notifications.length === 0) {
        return <ErrorUI error={error} fetch={() => fetchNotifications(1)} />;
    }

    return (
        <Main padding="p-3 md:p-12">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-sky-400 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-sky-200">
                                <Bell size={20} />
                            </div>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">
                            通知
                        </h1>
                    </div>
                    <p className="mt-2 text-chart-3 text-sm">
                        {unreadCount > 0
                            ? `未読の通知が ${unreadCount} 件あります`
                            : "未読の通知はありません"}
                    </p>
                </div>

                <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="bg-white border-2 border-slate-100 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 text-slate-600 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                    <CheckCheck size={18} />
                    すべて既読
                </button>
            </header>

            <div className="mb-6 inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === tab.id
                                ? "bg-white text-sky-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        {tab.label}
                        <span
                            className={`min-w-5 px-1.5 rounded-full text-[11px] font-bold ${
                                activeTab === tab.id
                                    ? "bg-sky-100 text-sky-600"
                                    : "bg-slate-200 text-slate-500"
                            }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {visibleNotifications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="relative inline-flex items-center justify-center mb-5">
                        <div className="absolute inset-0 bg-sky-100 rounded-full blur-xl opacity-70" />
                        <div className="w-20 h-20 bg-sky-50 rounded-3xl flex items-center justify-center text-sky-400 relative z-10 border-2 border-white shadow-inner">
                            <BellOff size={36} />
                        </div>
                    </div>
                    <p className="text-foreground text-lg font-bold mb-2">
                        {activeTab === "unread"
                            ? "未読の通知はありません"
                            : "まだ通知がありません"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        あなたの投稿へのいいねやコメントがここに表示されます
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visibleNotifications.map((notification) => {
                        const config = KIND_CONFIG[notification.kind];
                        const actorName = notification.actor?.display_name;
                        const restMessage =
                            actorName &&
                            notification.message.startsWith(actorName)
                                ? notification.message.slice(actorName.length)
                                : null;

                        return (
                            <button
                                key={notification.id}
                                type="button"
                                onClick={() => clickHandler(notification)}
                                className={`group relative w-full text-left overflow-hidden rounded-3xl border shadow-sm p-4 sm:p-5 transition-all hover:shadow-md hover:border-sky-200 hover:-translate-y-0.5 cursor-pointer ${
                                    notification.read
                                        ? "bg-white border-slate-100"
                                        : "bg-sky-50/60 border-sky-100"
                                }`}
                            >
                                {!notification.read && (
                                    <span className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-sky-400 to-blue-500" />
                                )}

                                <div className="flex items-start gap-3 sm:gap-4 pl-1">
                                    <div className="relative shrink-0">
                                        <UserAvatar
                                            name={actorName || "匿名"}
                                            size={44}
                                            className="rounded-full ring-2 ring-white shadow-sm"
                                        />
                                        <span
                                            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-white ${config.badge}`}
                                        >
                                            <config.Icon size={12} />
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm sm:text-[15px] leading-relaxed break-words ${
                                                notification.read
                                                    ? "text-slate-500"
                                                    : "text-slate-800"
                                            }`}
                                        >
                                            {restMessage !== null ? (
                                                <>
                                                    <span className="font-bold text-slate-900">
                                                        {actorName}
                                                    </span>
                                                    {restMessage}
                                                </>
                                            ) : (
                                                notification.message
                                            )}
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${config.chip}`}
                                            >
                                                {config.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {relativeTime(
                                                    notification.created_at,
                                                    now,
                                                )}
                                            </span>
                                            {!notification.post_id && (
                                                <span className="text-xs text-slate-400">
                                                    元の投稿は削除されています
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-2 self-center">
                                        {!notification.read && (
                                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                                        )}
                                        {notification.post_id && (
                                            <ChevronRight
                                                size={18}
                                                className="text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all"
                                            />
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {hasNextPage && activeTab === "all" && (
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="outline"
                                onClick={() => fetchNotifications(page + 1)}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? "読み込み中..." : "もっと読む"}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </Main>
    );
};

export default NotificationsPage;
