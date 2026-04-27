import Link from "next/link";

import {
    ChevronLeft,
    User,
    MapPin,
    Calendar,
    JapaneseYen,
    Users,
    SquareArrowOutUpRight,
    Instagram,
    Facebook,
    Mail,
    Globe,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

import Main from "@/components/ui/PageMain";
import { clubs } from "@/constants/clubs";

import type { Club } from "@/components/features/clubs/types";

type ClubDetailPageProps = {
    params: {
        slug: string;
    };
};

const ClubDetailPage = async ({ params }: ClubDetailPageProps) => {
    const resolveParams = await params;
    const clubSlug = resolveParams.slug;

    const club: Club | undefined = clubs.find((c) => c.slug === clubSlug);

    if (!club) {
        return (
            <Main>
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-bold mb-4">サークルが見つかりません</h2>
                    <p className="text-muted-foreground">
                        お探しのサークルは見つかりませんでした。
                    </p>
                </div>
            </Main>
        )
    }

    return (
        <Main padding="px-0 lg:p-12">
            <div className="hidden lg:block mb-4">
                <Link
                    href="/clubs"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft size={16} />
                    サークル一覧に戻る
                </Link>
            </div>

            <section className="group relative flex flex-col w-full lg:bg-card lg:rounded-2xl lg:shadow-sm lg:overflow-hidden lg:justify-end lg:min-h-110 lg:cursor-pointer">
                <Link
                    href="/clubs"
                    className="lg:hidden absolute top-4 left-4 z-20 flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm text-black rounded-full shadow-sm active:scale-95 transition-transform"
                    aria-label="戻る"
                >
                    <ChevronLeft size={24} className="pr-0.5" />
                </Link>

                <div
                    className="w-full h-70 md:h-100 lg:absolute lg:inset-0 lg:h-full z-0"
                    style={{
                        backgroundImage: `url(${club.imgUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />

                <div className="hidden lg:block absolute inset-0 bg-blue-600/50 mix-blend-multiply z-0 transition-opacity duration-300 group-hover:opacity-0" />
                <div className="hidden lg:block absolute inset-0 bg-linear-to-r from-blue-900/80 to-transparent z-0 transition-opacity duration-300 group-hover:opacity-0" />

                <div className="relative z-10 pt-6 pb-6 px-6 lg:p-12 bg-background lg:bg-transparent -mt-6 lg:mt-0 rounded-t-3xl lg:rounded-none lg:text-white transition-opacity duration-300 lg:group-hover:opacity-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3 lg:mb-4">
                        <span className="flex items-center gap-1.5 bg-blue-50 lg:bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium">
                            <club.categoryIcon size={16} />
                            {club.category}
                        </span>
                        <span className="flex items-center gap-1.5 bg-blue-50 lg:bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium">
                            <User size={16} />
                            メンバー{club.members}
                        </span>
                        <span 
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                                club.status === "募集中" 
                                ? "bg-emerald-100 text-emerald-700 lg:bg-emerald-500 lg:text-white" 
                                : "bg-gray-100 text-gray-500 lg:bg-gray-500 lg:text-white"
                            }`}
                        >
                            {club.status === "募集中" ? "✨ 募集中" : "募集終了"}
                        </span>
                    </div>

                    <h1 className="text-2xl lg:text-4xl font-bold">
                        {club.name}
                    </h1>

                    <p className="text-muted-foreground lg:text-white/90 max-w-2xl leading-relaxed text-sm lg:text-base">
                        {club.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-1 lg:mt-2">
                        {club.tags.map((tag) => (
                            <span 
                                key={tag} 
                                className="px-3 py-1 bg-muted lg:bg-white/20 text-muted-foreground lg:text-white rounded-md text-xs font-medium backdrop-blur-sm"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <div className="mb-12 px-6 md:mt-4 lg:mt-12 lg:p-0 grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="col-span1 lg:col-span-2 space-y-10">
                    <section className="bg-card p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 pl-4 border-l-4 border-blue-500">
                            サークルの説明
                        </h2>
                        <p>{club.longDescription}</p>
                    </section>

                    <section className="bg-card p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 pl-4 border-l-4 border-blue-500">
                            活動情報
                        </h2>

                        <ul className="flex flex-col">
                            <li className="flex flex-col lg:flex-row items-start py-4 border-b border-border">
                                <div className="flex items-center gap-3 w-40 shrink-0">
                                    <span className="p-2 rounded-full bg-blue-100 text-blue-600">
                                        <MapPin size={20} />
                                    </span>
                                    <p className="font-medium">活動場所</p>
                                </div>
                                <span className="text-muted-foreground whitespace-pre-wrap pt-1">
                                    {club.location}
                                </span>
                            </li>

                            <li className="flex flex-col lg:flex-row items-start py-4 border-b border-border">
                                <div className="flex items-center gap-3 w-40 shrink-0">
                                    <span className="p-2 rounded-full bg-green-100 text-green-600">
                                        <Calendar size={20} />
                                    </span>
                                    <p className="font-medium">活動日時</p>
                                </div>
                                <span className="text-muted-foreground whitespace-pre-wrap pt-1">
                                    {club.schedule}
                                </span>
                            </li>

                            <li className="flex flex-col lg:flex-row items-start py-4 border-b border-border">
                                <div className="flex items-center gap-3 w-40 shrink-0">
                                    <span className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                                        <JapaneseYen size={20} />
                                    </span>
                                    <p className="font-medium">費用</p>
                                </div>
                                <span className="text-muted-foreground whitespace-pre-wrap pt-1">
                                    {club.costs}
                                </span>
                            </li>

                            <li className="flex flex-col lg:flex-row items-start py-4 border-b border-border">
                                <div className="flex items-center gap-3 w-40 shrink-0">
                                    <span className="p-2 rounded-full bg-purple-100 text-purple-600">
                                        <Users size={20} />
                                    </span>
                                    <p className="font-medium">男女比</p>
                                </div>

                                <div className="w-full">
                                    <span className="text-muted-foreground block mb-2">
                                        男性：{club.GenderRatio.male}%　女性：
                                        {club.GenderRatio.female}%
                                    </span>
                                    <div className="h-2 w-full rounded-full overflow-hidden bg-gray-200 flex">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{
                                                width: `${club.GenderRatio.male}%`,
                                            }}
                                        />
                                        <div
                                            className="h-full bg-pink-400"
                                            style={{
                                                width: `${club.GenderRatio.female}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>
                <div className="col-span1 lg:col-span-1 ">
                    <section className="bg-card p-4 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 pl-4 border-l-4 border-blue-500">
                            お問い合わせ
                        </h2>
                        <ul>
                            {club.contact?.instagram && (
                                <li className="group border-b border-border p-1 last:border-b-0">
                                    <Link
                                        href={club.contact.instagram.url}
                                        className="flex items-center justify-between w-full gap-3 rounded-lg p-3 transition-all duration-200 ease-out hover:bg-blue-50/70 hover:translate-x-0.5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Instagram
                                                size={18}
                                                className="shrink-0 text-foreground/80 transition-all duration-200 group-hover:scale-110 group-hover:text-pink-600"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-medium leading-tight">
                                                    Instagram
                                                </p>
                                                <span className="text-muted-foreground leading-tight truncate block">
                                                    {
                                                        club.contact.instagram
                                                            .username
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <SquareArrowOutUpRight
                                            size={16}
                                            className="shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                                        />
                                    </Link>
                                </li>
                            )}
                            {club.contact?.twitter && (
                                <li className="group border-b border-border p-1 last:border-b-0">
                                    <Link
                                        href={club.contact.twitter.url}
                                        className="flex items-center justify-between w-full gap-3 rounded-lg p-3 transition-all duration-200 ease-out hover:bg-blue-50/70 hover:translate-x-0.5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FaXTwitter
                                                size={18}
                                                className="shrink-0 text-[17px] text-foreground/80 transition-all duration-200 group-hover:scale-110 group-hover:text-black dark:group-hover:text-white"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-medium leading-tight">
                                                    X（旧Twitter）
                                                </p>
                                                <span className="text-muted-foreground leading-tight truncate block">
                                                    {
                                                        club.contact.twitter
                                                            .username
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <SquareArrowOutUpRight
                                            size={16}
                                            className="shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                                        />
                                    </Link>
                                </li>
                            )}
                            {club.contact?.facebook && (
                                <li className="group border-b border-border p-1 last:border-b-0">
                                    <Link
                                        href={club.contact.facebook.url}
                                        className="flex items-center justify-between w-full gap-3 rounded-lg p-3 transition-all duration-200 ease-out hover:bg-blue-50/70 hover:translate-x-0.5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Facebook
                                                size={18}
                                                className="shrink-0 text-foreground/80 transition-all duration-200 group-hover:scale-110 group-hover:text-blue-600"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-medium leading-tight">
                                                    Facebook
                                                </p>
                                                <span className="text-muted-foreground leading-tight truncate block">
                                                    {
                                                        club.contact.facebook
                                                            .username
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <SquareArrowOutUpRight
                                            size={16}
                                            className="shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                                        />
                                    </Link>
                                </li>
                            )}
                            {club.contact?.email && (
                                <li className="group border-b border-border p-1 last:border-b-0">
                                    <Link
                                        href={`mailto:${club.contact.email}`}
                                        className="flex items-center justify-between w-full gap-3 rounded-lg p-3 transition-all duration-200 ease-out hover:bg-blue-50/70 hover:translate-x-0.5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Mail
                                                size={18}
                                                className="shrink-0 text-foreground/80 transition-all duration-200 group-hover:scale-110 group-hover:text-amber-500"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-medium leading-tight">
                                                    Email
                                                </p>
                                                <span className="text-muted-foreground leading-tight truncate block">
                                                    {club.contact.email}
                                                </span>
                                            </div>
                                        </div>

                                        <SquareArrowOutUpRight
                                            size={16}
                                            className="shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                                        />
                                    </Link>
                                </li>
                            )}
                            {club.contact?.website && (
                                <li className="group border-b border-border p-1 last:border-b-0">
                                    <Link
                                        href={club.contact.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between w-full gap-3 rounded-lg p-3 transition-all duration-200 ease-out hover:bg-blue-50/70 hover:translate-x-0.5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Globe
                                                size={18}
                                                className="shrink-0 text-foreground/80 transition-all duration-200 group-hover:scale-110 group-hover:text-emerald-500"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-medium leading-tight">
                                                    Website
                                                </p>
                                                <span className="text-muted-foreground leading-tight truncate block">
                                                    {club.contact.website}
                                                </span>
                                            </div>
                                        </div>

                                        <SquareArrowOutUpRight
                                            size={16}
                                            className="shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                                        />
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </section>
                </div>
            </div>
        </Main>
    );
};

export default ClubDetailPage;
