import { LucideIcon } from "lucide-react";

type HeaderProps = {
    icon: LucideIcon;
    saveHandler: (e: React.FormEvent) => void;
};

const Header = ({ icon: Icon, saveHandler }: HeaderProps) => {
    return (
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl text-slate-900 font-bold">設定</h1>
                    <p className="mt-2 text-slate-500">
                        アカウントの管理とアプリケーションのカスタマイズ
                    </p>
                </div>
                <button
                    onClick={saveHandler}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-sky-200 transition-all action:scale-95 flex items-center gap-2 cursor-pointer"
                >
                    <Icon size={20} />
                    変更を保存
                </button>
            </header>
    );
}

export default Header;