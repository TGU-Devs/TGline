import SettingSection from "./SettingSection";
import { FormValues, Errors } from "./types";
import type { LucideIcon } from "lucide-react";
import Avatar from "boring-avatars";

type ProfileSectionProps = {
    formValues: FormValues;
    formErrors: Errors;
    icon: LucideIcon;
    isOAuthUser: boolean;
    onchangeHandler: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
};

const ProfileSection = ({
    formValues,
    formErrors,
    icon: Icon,
    isOAuthUser,
    onchangeHandler,
}: ProfileSectionProps) => {
    return (
        <SettingSection title="プロフィール設定" icon={Icon}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-20 h-20 bg-sky-600 rounded-full mb-4 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                    <Avatar
                        name={formValues.display_name || ""}
                        variant="beam"
                        size={80}
                    />
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
                            maxLength={20}
                            className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                            required
                        />
                        <div className="flex justify-between">
                            {formErrors.display_name ? (
                                <p className="text-red-500 text-sm">{formErrors.display_name}</p>
                            ) : <span />}
                            <span className={`text-xs ${formValues.display_name.length >= 20 ? "text-red-500" : "text-slate-400"}`}>{formValues.display_name.length}/20</span>
                        </div>
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
                            disabled={isOAuthUser}
                            className={`w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all ${
                                isOAuthUser
                                    ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                                    : "bg-slate-50 focus:ring-2 focus:ring-sky-500"
                            }`}
                            required
                        />
                        {isOAuthUser && (
                            <p className="text-slate-500 text-sm mt-1">
                                Googleログインユーザーはメールアドレスを変更できません。
                            </p>
                        )}
                        {formErrors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.email}
                            </p>
                        )}
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
