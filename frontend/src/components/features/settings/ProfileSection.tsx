import SettingSection from "./SettingSection";
import { FormValues } from "./types";
import type { LucideIcon } from "lucide-react";

type ProfileSectionProps = {
    currentUserName: string;
    formValues: FormValues;
    icon: LucideIcon;
    onchangeHandler: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const ProfileSection = ({
    currentUserName,
    formValues,
    icon: Icon,
    onchangeHandler,
}: ProfileSectionProps) => {
    return (
        <SettingSection title="プロフィール設定" icon={Icon}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-20 h-20 bg-sky-600 rounded-full mb-4 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                    {currentUserName.charAt(0)}
                </div>

                <fieldset className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-1">
                        <label
                            htmlFor="display_name"
                            className="text-sm font-bold text-slate-400 ml-1"
                        >
                            ユーザー名
                        </label>
                        <input
                            type="text"
                            id="display_name"
                            value={formValues.display_name}
                            onChange={onchangeHandler}
                            className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label
                            htmlFor="email"
                            className="text-sm font-bold text-slate-400 ml-1"
                        >
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formValues.email}
                            onChange={onchangeHandler}
                            className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label
                            htmlFor="description"
                            className="text-sm font-bold text-slate-400 ml-1"
                        >
                            自己紹介
                        </label>
                        <textarea
                            rows={2}
                            id="description"
                            value={formValues.description || ""}
                            onChange={onchangeHandler}
                            className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                        />
                    </div>
                </fieldset>
            </div>
        </SettingSection>
    );
};

export default ProfileSection;
