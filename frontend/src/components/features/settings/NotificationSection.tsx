import SettingSection from "./SettingSection";
import CommingSoonBadge from "./ComingSoonBadge";
import type { Notification } from "./types";
import { LucideIcon } from "lucide-react";

type NotificationSectionProps = {
    notifications: Notification[];
    icon: LucideIcon;
};

const NotificationSection = ({
    notifications,
    icon: Icon,
}: NotificationSectionProps) => {
    return (
        <div className="relative">
            <SettingSection title="通知設定" icon={Icon}>
                <fieldset disabled>
                    <ul className="space-y-4 opacity-50">
                        {notifications.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between py-1"
                            >
                                <div className="flex items-center gap-3">
                                    <item.Icon
                                        size={18}
                                        className="text-slate-400"
                                    />
                                    <span className="font-medium text-slate-700">
                                        {item.label}
                                    </span>
                                </div>
                                <label className="relative inline-block w-11 h-6 cursor-not-allowed">
                                    <input
                                        type="checkbox"
                                        name={item.id}
                                        id={item.id}
                                        defaultChecked={item.checked}
                                        disabled
                                        className="sr-only peer"
                                    />
                                    <span className="absolute inset-0 bg-slate-300 rounded-full transition-colors peer-checked:bg-sky-500"></span>
                                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </fieldset>
            </SettingSection>
            <CommingSoonBadge />
        </div>
    );
};

export default NotificationSection;
