import SettingSection from "./SettingSection";
import type { SecurityOption } from "./types";
import { type LucideIcon, ChevronRight } from "lucide-react";

type SecuritySectionProps = {
    icon: LucideIcon;
    securityOptions: SecurityOption[];
};

const SecuritySection = ({
    icon: Icon,
    securityOptions,
}: SecuritySectionProps) => {
    return (
        <SettingSection title="アカウントとセキュリティ" icon={Icon}>
            <div className="space-y-2">
                {securityOptions.map((option) => (
                    <button
                        type="button"
                        key={option.id}
                        className="w-full flex items-center justify-between p-4 rounded-xl transition-all group hover:bg-slate-50 cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <option.Icon
                                size={18}
                                className={
                                    option.changePassword
                                        ? "text-slate-400"
                                        : "text-red-400"
                                }
                            />
                            <span
                                className={`font-medium ${option.changePassword ? "text-slate-700" : "text-red-500"}`}
                            >
                                {option.label}
                            </span>
                        </div>
                        <ChevronRight
                            size={18}
                            className={`text-slate-300 group-hover:translate-x-1 transition-all ${
                                option.changePassword
                                    ? "group-hover:text-sky-500"
                                    : "group-hover:text-red-500"
                            }`}
                        />
                    </button>
                ))}
            </div>
        </SettingSection>
    );
};

export default SecuritySection;
