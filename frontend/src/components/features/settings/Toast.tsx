import type { LucideIcon } from "lucide-react";

type ToastProps = {
    showToast: boolean;
    icon: LucideIcon;
    message: string;
    bg: string;
};

const Toast = ({ showToast, icon: Icon, message, bg }: ToastProps) => {
    return (showToast && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right ">
                    <div className={`${bg} text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 font-bold`}>
                        <Icon size={20} />
                        <span>{message}</span>
                    </div>
                </div>
            ));
}

export default Toast;