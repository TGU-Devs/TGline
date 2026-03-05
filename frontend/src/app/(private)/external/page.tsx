import Header from "@/components/features/external/Header";
import ExternalContent from "@/components/features/external/ExternalContent";
import Help from "@/components/features/external/Help";
import type { ExternalSite } from "@/components/features/external/types";
import {
    GraduationCap,
    BookOpen,
    FolderOpen,
    Monitor,
    Trophy,
    HouseHeart,
    Book,
} from "lucide-react";

const externalSites: ExternalSite[] = [
    {
        title: "MYTG（東北学院大学数学系システム）",
        description:
            "履修登録、成績確認、授業の欠席届など、学生生活に必須のポータルサイトです。",
        url: "https://www.tohoku-gakuin.ac.jp/faculty/mytg/",
        icon: BookOpen,
        category: "教務・学習",
        iconClass: "text-chart-4 bg-chart-4/10",
    },
    {
        title: "東北学院大学公式サイト",
        description: "大学のニュース、入試情報、各学部の詳細が確認できます。",
        url: "https://www.tohoku-gakuin.ac.jp/",
        icon: GraduationCap,
        category: "大学公式サイト",
        iconClass: "text-primary bg-primary/10",
    },
    {
        title: "TG-folio（東北学院大学学生ポートフォリオ）",
        description:
            "学生の学習成果や活動を記録・共有するためのポートフォリオサイトです。",
        url: "https://sites.google.com/g.tohoku-gakuin.ac.jp/tg-folio",
        icon: FolderOpen,
        category: "教務・学習",
        iconClass: "text-chart-1 bg-chart-1/10",
    },
    {
        title: "東北学院大学ITナビ",
        description:
            "東北学院大学在籍者のための主要なITサービスや施設等の紹介サイトです。",
        url: "https://www.tohoku-gakuin.ac.jp/itnavi/",
        icon: Monitor,
        category: "IT関連",
        iconClass: "text-chart-3 bg-chart-3/10",
    },
    {
        title: "在学生向けサポートサイト",
        description: "在学生だけでなく、保護者や入学予定の方へ向けた生活や履修、施設など様々な情報をまとめたサポートサイトです。",
        url: "https://www.tohoku-gakuin.ac.jp/student/",
        icon: HouseHeart,
        category: "学生生活",
        iconClass: "text-chart-5 bg-chart-5/10",
    },
    {
        title: "TG MIND (課外活動応援サイト)",
        description:
            "東北学院大学の課外活動を支援するサイトで、サークルや部活動、イベント情報が掲載されています。",
        url: "https://www.tohoku-gakuin.ac.jp/tgmind/",
        icon: Trophy,
        category: "課外活動",
        iconClass: "text-chart-2 bg-chart-2/10",
    },
];

const ExternalPage = () => {
    return (
        <main className="min-h-screen bg-background p-8 md:p-12 duration-300">
            <div className="max-w-7xl mx-auto">
                <Header title="外部サイト" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-6">
                    {externalSites.map((site) => (
                        <ExternalContent key={site.url} site={site} />
                    ))}
                </div>

                <Help />
            </div>
        </main>
    );
};

export default ExternalPage;
