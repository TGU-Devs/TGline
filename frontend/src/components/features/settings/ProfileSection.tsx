"use client";

import { useEffect, useState, useRef } from "react";
import SettingSection from "./SettingSection";
import { FormValues, Errors } from "./types";
import type { LucideIcon } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

type ProfileSectionProps = {
    formValues: FormValues;
    formErrors: Errors;
    icon: LucideIcon;
    onchangeHandler: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    isAvatarDeleted: boolean;
    setIsAvatarDeleted: (deleted: boolean) => void;
    currentAvatarUrl?: string | null;
};

const ProfileSection = ({
    formValues,
    formErrors,
    icon: Icon,
    onchangeHandler,
    selectedFile,
    setSelectedFile,
    isAvatarDeleted,
    setIsAvatarDeleted,
    currentAvatarUrl,
}: ProfileSectionProps) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

           const url = URL.createObjectURL(selectedFile);
           setPreviewUrl(url); 

           return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setSelectedFile(file);
            setIsAvatarDeleted(false);
        }
    };

    const handleRemoveAvatar = () => {
        setSelectedFile(null);
        setIsAvatarDeleted(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const displayAvatarUrl = previewUrl || (isAvatarDeleted ? null : currentAvatarUrl);

return (
  <SettingSection title="プロフィール設定" icon={Icon}>
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
      <div className="flex flex-col items-center gap-3 w-full md:w-auto">
        <UserAvatar
          avatar={displayAvatarUrl ? { url: displayAvatarUrl } : null}
          name={formValues.display_name || "User"}
          size={80}
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id="avatar-upload"
        />

        <div className="flex flex-row md:flex-col gap-2 justify-center w-full max-w-xs md:max-w-none">
          <label
            htmlFor="avatar-upload"
            className="flex-1 md:flex-none text-xs text-center font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            画像を選択
          </label>

          {(displayAvatarUrl || selectedFile) && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="flex-1 md:flex-none text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              画像を削除
            </button>
          )}
        </div>
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
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all bg-slate-100 text-slate-500 cursor-not-allowed"
                        required
                    />
                    <p className="text-slate-500 text-sm mt-1">
                        現在、メールアドレスの変更はできません。
                    </p>
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
