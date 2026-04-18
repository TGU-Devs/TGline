"use client";

import { useState } from "react";
import Link from "next/link";

import { Users, Clock, MapPin } from "lucide-react";

import Main from "@/components/ui/PageMain";
import Header from "@/components/ui/PageHeader";

const statuses = ["すべて", "募集中", "締め切り"];
const categories = ["すべて", "体育会系", "文化系", "ボランティア", "その他"];

const clubs = [
    {
        name: "サークルA",
        category: "体育会系",
        status: "募集中",
        description: "サークルAの説明",
        members: 50 + "名",
        schedule: "毎週木曜日 18:00-20:00",
        location: "体育館",
        color: "bg-red-500",
        url: "/clubs/a",
    },
    {
        name: "サークルB",
        category: "文化系",
        status: "締め切り",

        description: "サークルBの説明",
        members: 30 + "名",
        schedule: "毎週金曜日 16:00-18:00",
        location: "文化館",
        color: "bg-blue-500",
        url: "/clubs/b",
    },
    {
        name: "サークルC",
        category: "ボランティア",
        status: "締め切り",
        description: "サークルCの説明",
        members: 20 + "名",
        schedule: "毎月第2水曜日 14:00-16:00",
        location: "ボランティアセンター",
        color: "bg-green-500",
        url: "/clubs/c",
    },
    {
        name: "サークルD",
        category: "その他",
        status: "募集中",
        description: "サークルDの説明",
        members: 10 + "名",
        schedule: "不定期",
        location: "その他",
        color: "bg-gray-500",
        url: "/clubs/d",
    },
];

const ClubPage = () => {
    const [activeStatus, setActiveStatus] = useState<string>("すべて");
    const [activeCategory, setActiveCategory] = useState<string>("すべて");
    return (
        <Main>
            <div className="flex flex-col  md:flex-row justify-between md:items-center md:gap-4">
                <Header
                    title="サークル・部活動"
                    description="東北学院大学サークル・部活動一覧"
                />

                <div className="flex items-center bg-destructive-foreground p-1 rounded-full border border-border-200 shadow-sm w-fit">
                    {statuses.map((status) => (
                        <button
                            key={status}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                                activeStatus === status
                                    ? "bg-foreground text-destructive-foreground shadow-sm"
                                    : "text-muted-foreground/50 hover:text-muted-foreground/90 hover:bg-muted/40"
                            }`}
                            onClick={() => setActiveStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer mt-8 ${
                            activeCategory === category
                                ? "bg-primary text-sidebar-primary-foreground shadow-sm"
                                : "bg-muted/40 text-muted-foreground hover:bg-muted"
                        }`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-6 mt-8">
                {clubs
                    .filter(
                        (club) =>
                            activeCategory === "すべて" ? true : club.category === activeCategory,
                    )
                    .filter(
                        (club) =>
                            activeStatus === "すべて" ? true : club.status === activeStatus,
                    )
                    .map((club) => (
                        <Link
                            href={club.url}
                            key={club.name}
                            className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all group"
                        >
                            {/* サークル画像エリア */}
                            <div className="relative h-56 bg-muted/20 flex items-center justify-center overflow-hidden">
                                <div
                                    className={`absolute inset-0 opacity-20 ${club.color.split(" ")[0]}`}
                                ></div>

                                <span
                                    className={`text-7xl font-black opacity-20 select-none ${club.color.split(" ")[1]}`}
                                >
                                    {club.name.charAt(4)}
                                </span>

                                <div className="absolute top-4 left-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${club.color}`}
                                    >
                                        {club.category}
                                    </span>
                                </div>

                                <div className="absolute top-4 right-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-[10px] font-black shadow-sm ${
                                            club.status === "募集中"
                                                ? "bg-card text-primary"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {club.status}
                                    </span>
                                </div>
                            </div>

                            {/* サークル詳細 */}
                            <div className="p-6">
                                <h3 className="text-xl font-black text-foreground mb-3 group-hover:text-primary transition-colors">
                                    {club.name}
                                </h3>
                                <p className="text-sm text-muted-foreground/90 leading-relaxed mb-6 line-clamp-2">
                                    {club.description}
                                </p>

                                <div className="space-y-3 pt-4 border-t border-sidebar-border/20">
                                    <div className="flex items-center gap-3 text-muted-foreground/70">
                                        <Users
                                            size={16}
                                            className="text-primary"
                                        />
                                        <span className="text-xs font-bold">
                                            {club.members}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground/70">
                                        <Clock
                                            size={16}
                                            className="text-primary"
                                        />
                                        <span className="text-xs font-bold">
                                            {club.schedule}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground/70">
                                        <MapPin
                                            size={16}
                                            className="text-primary"
                                        />
                                        <span className="text-xs font-bold">
                                            {club.location}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
            </div>
        </Main>
    );
};

export default ClubPage;
