"use client";

import { useState } from "react";
import SettingSection from "./SettingSection";
import type { Notification } from "./types";
import type { LucideIcon } from "lucide-react";

type NotificationSectionProps = {
    notifications: Notification[];
    icon: LucideIcon;
};

const collectChecked = (items: Notification[]) => {
    const map: Record<string, boolean> = {};
    const walk = (list: Notification[]) => {
        list.forEach((item) => {
            map[item.id] = item.checked;
            if (item.children) walk(item.children);
        });
    };
    walk(items);
    return map;
};

type NotificationRowProps = {
    item: Notification;
    checkedMap: Record<string, boolean>;
    parentEnabled?: boolean;
    onToggle: (id: string) => void;
};

const NotificationRow = ({
    item,
    checkedMap,
    parentEnabled = true,
    onToggle,
}: NotificationRowProps) => {
    const isComingSoon = Boolean(item.comingSoon);
    const enabled = !isComingSoon && parentEnabled;
    const checked = Boolean(checkedMap[item.id]);

    return (
        <li>
            <div className={`flex items-center justify-between py-1 ${enabled ? "" : "opacity-50"}`}>
                <div className="flex items-center gap-3">
                    <item.Icon size={18} className="text-slate-400" />
                    <span className="font-medium text-slate-700">{item.label}</span>
                    {isComingSoon && (
                        <span className="bg-amber-100 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            近日追加予定
                        </span>
                    )}
                </div>
                <label
                    className={`relative inline-block w-11 h-6 ${enabled ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                    <input
                        type="checkbox"
                        name={item.id}
                        id={item.id}
                        checked={checked}
                        disabled={!enabled}
                        onChange={() => onToggle(item.id)}
                        className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-slate-300 rounded-full transition-colors peer-checked:bg-sky-500"></span>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                </label>
            </div>
            {item.children && item.children.length > 0 && (
                <ul className="mt-3 ml-7 space-y-3 border-l border-slate-200 pl-4">
                    {item.children.map((child) => (
                        <NotificationRow
                            key={child.id}
                            item={child}
                            checkedMap={checkedMap}
                            parentEnabled={enabled && checked}
                            onToggle={onToggle}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

const NotificationSection = ({
    notifications,
    icon: Icon,
}: NotificationSectionProps) => {
    const [checkedMap, setCheckedMap] = useState(() => collectChecked(notifications));

    const onToggle = (id: string) => {
        setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="relative">
            <SettingSection title="通知設定" icon={Icon}>
                <ul className="space-y-4">
                    {notifications.map((item) => (
                        <NotificationRow
                            key={item.id}
                            item={item}
                            checkedMap={checkedMap}
                            onToggle={onToggle}
                        />
                    ))}
                </ul>
            </SettingSection>
        </div>
    );
};

export default NotificationSection;
