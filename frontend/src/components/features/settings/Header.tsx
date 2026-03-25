import HeaderString from "@/components/ui/PageHeader";
import type { LucideIcon } from "lucide-react";

type HeaderProps = {
    icon: LucideIcon;
    saveHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const Header = ({ icon: Icon, saveHandler }: HeaderProps) => {
    return (
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
            <HeaderString title="設定" description="アカウントの管理とアプリケーションのカスタマイズ" />
            <button
                onClick={saveHandler}
                className="bg-sky-500 hover:bg-sky-600 text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-sky-200 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
                <Icon size={20} />
                変更を保存
            </button>
        </header>
    );
};

export default Header;
