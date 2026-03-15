import Header from "@/components/ui/PageHeader";
import Main from "@/components/ui/PageMain";
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
    Instagram,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

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
        description:
            "在学生だけでなく、保護者や入学予定の方へ向けた生活や履修、施設など様々な情報をまとめたサポートサイトです。",
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
    {
        title: "東北学院大学情報局（部活・サークル紹介）",
        description:
            "東北学院大学のサークル・部活動・就活情報を紹介するInstagramアカウントで、大学生活を充実させるための情報が発信されています。",
        url: "https://www.instagram.com/tohoku_gakuin_recommend?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
        icon: Instagram,
        category: "SNS・情報発信",
        iconClass: "text-chart-5 bg-chart-5/10",
    },
    {
        title: "TGline公式Instagram",
        description:
            "TGlineの公式Instagramアカウントで、アプリ内のアップデート情報やイベント情報を発信しています。",
        url: "https://www.instagram.com/our_tgline?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
        icon: Instagram,
        category: "SNS・情報発信",
        iconClass: "text-chart-5 bg-chart-5/10",
    },
    {
        title: "TGline公式X（旧Twitter）",
        description:
            "TGlineの公式X（旧Twitter）アカウントで、アプリ内のアップデート情報やイベント情報を発信しています。",
        url: "https://l.instagram.com/?u=https%3A%2F%2Fx.com%2Four_tgline%3Fs%3D21%26fbclid%3DPAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnzgF3VgTp9AdEC9lJEqmIY2VVp3F1LEUBEx5Zj-VlcIpWymxtPf1THSmCfh0_aem_GgCWGLZ0870I2fOsMHwamA&e=AT7COzcsClCuAdfluRMlkv9y34lQTEmu0kkgOmr-wsz4aoNwjCw7peB9jH1cSH9akEzwoAdh6aBJpj2gFadMLTGVkUlK6OHi20OWaXAzMQ",
        icon: FaXTwitter,
        category: "SNS・情報発信",
        iconClass: "text-foreground bg-foreground/10",
    },
];

const ExternalPage = () => {
    return (
        <Main>
            <Header
                title="外部サイト"
                description="東北学院大学関連サイト一覧"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-6 mt-8">
                {externalSites.map((site) => (
                    <ExternalContent key={site.url} site={site} />
                ))}
            </div>
            <Help />
        </Main>
    );
};

export default ExternalPage;
