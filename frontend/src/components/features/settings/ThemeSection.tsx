import SettingSection from "./SettingSection";
import ComingSoonBadge from "./ComingSoonBadge";
import type { ThemeOption } from "./types";
import type { LucideIcon } from "lucide-react";

type ThemeSectionProps = {
    themeOptions: ThemeOption[];
    changeDarkMode: (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>, isDarkMode: boolean) => void;
    icon: LucideIcon;
};

const ThemeSection = ({ themeOptions, icon: Icon, changeDarkMode }: ThemeSectionProps) => {
    return (
        <div className="relative">
            <SettingSection title="テーマ" icon={Icon}>
                <div className="opacity-50">
                    <fieldset disabled className="flex gap-4">
                        {themeOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                disabled
                                onClick={(e) => changeDarkMode(e, option.id === "dark")}
                                className={`flex-1 p-9 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-not-allowed ${option.btnStyle}`}
                            >
                                <option.Icon
                                    size={24}
                                    className={option.className}
                                />
                                <span className="text-sm font-bold text-current">
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </fieldset>
                </div>
            </SettingSection>
            <ComingSoonBadge />
        </div>
    );
};

export default ThemeSection;
