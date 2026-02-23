import { Bell, Sparkles, Home, Clock } from "lucide-react";

type MainContentProps = {
    clickHandler?: () => void;
};

const MainContent = ({ clickHandler }: MainContentProps) => {
    return (
        <div className="relative z-10 bg-white/70 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-sky-100/50 border border-white max-w-lg w-full text-center">
            <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-sky-200 rounded-full blur-xl opacity-50"></div>

                <div className="w-24 h-24 bg-sky-50 rounded-4xl flex items-center justify-center text-sky-500 relative z-10 border-2 border-white shadow-inner transform -rotate-12">
                    <Bell size={48} />
                </div>

                <div className="absolute -top-2 -right-2 z-20">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-8 w-8 bg-linear-to-tr from-sky-400 to-blue-500 border-2 border-white items-center justify-center shadow-md">
                        <Sparkles size={14} className="text-white" />
                    </span>
                </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-bold text-sm mb-6">
                <Clock size={16} />
                <span>Coming Soon</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">
                通知画面は
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-500 to-blue-600">
                    現在準備中
                </span>
                です
            </h1>

            <p className="text-slate-500 mb-10 leading-relaxed text-sm md:text-base">
                新しい投稿への反応や、あなた宛の大切なお知らせをここでお届けする予定です。
                <br />
                アップデートを楽しみにお待ちください！
            </p>

            <button
                className="bg-white border-2 border-slate-100 hover:border-sky-300 hover:bg-sky-50 text-slate-600 hover:text-sky-600 px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mx-auto shadow-sm group w-full sm:w-auto"
                onClick={clickHandler}
            >
                <Home
                    size={16}
                    className="group-hover:-translate-x-1 transition-transform"
                />
                投稿一覧に戻る
            </button>
        </div>
    );
};
export default MainContent;
