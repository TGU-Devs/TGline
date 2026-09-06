"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Main from "@/components/ui/PageMain";
import Loading from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/ErrorUI";
import Header from "@/components/features/notifications/Header";
import Tabs from "@/components/features/notifications/Tabs";
import NoNotifications from "@/components/features/notifications/NoNotifications";
import List from "@/components/features/notifications/List";
import { apiFetch } from "@/lib/api";

import type { Notification, FilterTab, Tab } from "@/components/features/notifications/types";

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

    const tabs: Tab[] = [
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
            <Header unreadCount={unreadCount} markAllAsRead={markAllAsRead} />

            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {visibleNotifications.length === 0 ? (
                <NoNotifications activeTab={activeTab} />
            ) : (
                <List visibleNotifications={visibleNotifications} activeTab={activeTab} isLoadingMore={isLoadingMore} hasNextPage={hasNextPage} page={page} now={now} fetchNotifications={fetchNotifications} clickHandler={clickHandler} />
            )}
        </Main>
    );
};

export default NotificationsPage;
