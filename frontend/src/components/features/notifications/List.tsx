import { Heart, MessageCircle, ChevronRight } from "lucide-react";
import type { FilterTab } from "@/app/(private)/notifications/page";
import type { Notification  } from "@/app/(private)/notifications/page";
import NextPageButton from "@/components/features/notifications/NextPageButton";
import UserAvatar from "@/components/UserAvatar";
import formatDate from "@/utils/formatDate";

type ListProps = {
    visibleNotifications: Notification[];
    activeTab: FilterTab;
    isLoadingMore: boolean;
    hasNextPage: boolean;
    page: number;
    now: number | null;
    fetchNotifications: (page: number) => void;
    clickHandler: (notification: Notification) => void;
};

// 通知の種類ごとの設定
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

// 通知の作成時間を相対時間に変換
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

const List = ({ visibleNotifications, activeTab, isLoadingMore, hasNextPage, page, now, fetchNotifications, clickHandler }: ListProps) => {
    return (
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
                        <NextPageButton page={page} fetchNotifications={fetchNotifications} isLoadingMore={isLoadingMore} />
                    )}
                </div>
    );
};

export default List;