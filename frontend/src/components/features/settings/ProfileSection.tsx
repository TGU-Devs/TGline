import SettingSection from "./SettingSection";
import type { LucideIcon } from "lucide-react";

type ProfileSectionProps = {
    icon: LucideIcon;
    currentUser: {
        displayName: string;
        email: string;
        bio: string| null;
    };
};

const ProfileSection = ({ currentUser, icon: Icon }: ProfileSectionProps) => {
    return (
        <SettingSection title="プロフィール設定" icon={Icon}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-20 h-20 bg-sky-600 rounded-full mb-4 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                    {currentUser.displayName.charAt(0)}
                </div>

                <fieldset className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-1">
                        <label
                            htmlFor="username"
                            className="text-sm font-bold text-slate-400 ml-1"
                        >
                            ユーザー名
                        </label>
                        <input
                            type="text"
                            id="username"
                            defaultValue={currentUser.displayName}
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
                            defaultValue={currentUser.email}
                            className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label
                            htmlFor="bio"
                            className="text-sm font-bold text-slate-400 ml-1"
                        >
                            自己紹介
                        </label>
                        <textarea
                            rows={2}
                            id="bio"
                            className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                        >
                            {currentUser.bio ?? ""}
                        </textarea>
                    </div>
                </fieldset>
            </div>
        </SettingSection>
    );
};

export default ProfileSection;
