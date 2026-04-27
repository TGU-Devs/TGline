import { Dumbbell, Palette, HeartHandshake, Shapes } from "lucide-react";
import type { Club } from "@/components/features/clubs/types";

const mockClubsContact = {
    instagram: {
        username: "hikakin",
        url: "https://www.instagram.com/hikakin?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    },
    twitter: {
        username: "hikakin",
        url: "https://x.com/hikakin?s=20",
    },
    facebook: {
        username: "HIKAKIN",
        url: "https://www.facebook.com/HIKAKIN/",
    },
    email: "tguboard@gmail.com",
    website: "https://www.tgu.ac.jp/",
};

export const clubs: Club[] = [
    {
        slug: "club-a",
        name: "サークルA",
        category: "体育会系",
        categoryIcon: Dumbbell,
        status: "募集中",
        shortDescription: "サークルAの説明",
        longDescription:
            "サークルAの詳細な説明。活動内容や目的などを詳しく記載します。",
        members: 50 + "名",
        location: "〇〇大学第一体育館",
        schedule: "毎週木曜日 18:00-20:00",
        costs: "月額500円",
        GenderRatio: { male: 60, female: 40 },
        imgUrl: ["/clubs/club-a/club-a1.jpg", "/clubs/club-a/club-a2.jpg", "/clubs/club-a/club-a3.jpg"],
        contact: {
            ...mockClubsContact,
        },
        tags: ["初心者歓迎", "インカレ", "週2日活動", "飲み会少なめ"],
        color: "bg-red-500",
    },
    {
        slug: "club-b",
        name: "サークルB",
        category: "文化系",
        categoryIcon: Palette,
        status: "締め切り",
        shortDescription: "サークルBの説明",
        longDescription:
            "サークルBの詳細な説明。活動内容や目的などを詳しく記載します。",
        members: 30 + "名",
        location: "文化館",
        schedule: "毎週金曜日 16:00-18:00",
        costs: "月額300円",
        GenderRatio: { male: 40, female: 60 },
        imgUrl: ["/clubs/club-b/club-b1.jpg", "/clubs/club-b/club-b2.jpg", "/clubs/club-b/club-b3.jpg"],
        contact: {
            instagram: {
                username: mockClubsContact.instagram.username,
                url: mockClubsContact.instagram.url,
            },
            twitter: {
                username: mockClubsContact.twitter.username,
                url: mockClubsContact.twitter.url,
            },
            email: mockClubsContact.email,
        },
        tags: ["初心者歓迎", "週2日活動"],
        color: "bg-blue-500",
    },
    {
        slug: "club-c",
        name: "サークルC",
        category: "ボランティア",
        categoryIcon: HeartHandshake,
        status: "締め切り",
        shortDescription: "サークルCの説明",
        longDescription:
            "サークルCの詳細な説明。活動内容や目的などを詳しく記載します。",
        members: 20 + "名",
        location: "ボランティアセンター",
        schedule: "毎月第2水曜日 14:00-16:00",
        costs: "月額200円",
        GenderRatio: { male: 30, female: 70 },
        imgUrl: ["/clubs/club-c/club-c1.jpg", "/clubs/club-c/club-c2.jpg", "/clubs/club-c/club-c3.jpg"],
        contact: {
            instagram: {
                username: mockClubsContact.instagram.username,
                url: mockClubsContact.instagram.url,
            },
            email: mockClubsContact.email,
        },
        tags: ["やる気ある人募集", "週2日活動"],
        color: "bg-green-500",
    },
    {
        slug: "club-d",
        name: "サークルD",
        category: "その他",
        categoryIcon: Shapes,
        status: "募集中",
        shortDescription: "サークルDの説明",
        longDescription:
            "サークルDの詳細な説明。活動内容や目的などを詳しく記載します。",
        members: 10 + "名",
        location: "その他",
        schedule: "不定期",
        costs: "月額100円",
        GenderRatio: { male: 50, female: 50 },
        imgUrl: ["/clubs/club-d/club-d1.jpg", "/clubs/club-d/club-d2.jpg"],
        contact: {
            email: mockClubsContact.email,
        },
        tags: ["初心者歓迎"],
        color: "bg-gray-500",
    },
];
