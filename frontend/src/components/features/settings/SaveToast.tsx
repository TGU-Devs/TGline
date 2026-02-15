import type { LucideIcon } from "lucide-react";

type SaveToastProps = {
    showSaveToast: boolean;
    icon: LucideIcon;
};

const SaveToast = ({ showSaveToast, icon: Icon }: SaveToastProps) => {
    return (showSaveToast && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right ">
                    <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 font-bold">
                        <Icon size={20} />
                        <span>設定を保存しました。</span>
                    </div>
                </div>
            ));
}

export default SaveToast;