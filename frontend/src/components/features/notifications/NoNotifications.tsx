import { BellOff } from "lucide-react";
import type { FilterTab } from "@/app/(private)/notifications/page";

type NoNotificationsProps = {
    activeTab: FilterTab;
};

const NoNotifications = ({ activeTab }: NoNotificationsProps) => {
    return (
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
    );
};

export default NoNotifications;