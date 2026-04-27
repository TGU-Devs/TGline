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
import BackButton from "@/components/features/clubs/details/BackButton";
import HeroSection from "@/components/features/clubs/details/HeroSection";
import ClubDescription from "@/components/features/clubs/details/ClubDescription";
import ClubActivityInfo from "@/components/features/clubs/details/ClubActivityInfo";
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
                    <h2 className="text-2xl font-bold mb-4">
                        サークルが見つかりません
                    </h2>
                    <p className="text-muted-foreground">
                        お探しのサークルは見つかりませんでした。
                    </p>
                </div>
            </Main>
        );
    }

    return (
        <Main padding="px-0 lg:p-12">
            <BackButton />

            <HeroSection club={club} />

            <div className="mb-12 px-6 md:mt-4 lg:mt-12 lg:p-0 grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="col-span1 lg:col-span-2 space-y-10">
                    <ClubDescription description={club.longDescription} />

                    <ClubActivityInfo
                        location={club.location}
                        schedule={club.schedule}
                        costs={club.costs}
                        GenderRatio={club.GenderRatio}
                    />
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
