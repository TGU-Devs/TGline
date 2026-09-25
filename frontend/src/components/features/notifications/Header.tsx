import { Bell, CheckCheck } from "lucide-react";

type HeaderProps = {
    unreadCount: number;
    markAllAsRead: () => void;
};

const Header = ({ unreadCount, markAllAsRead }: HeaderProps) => {
    return (
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
    );
};

export default Header;