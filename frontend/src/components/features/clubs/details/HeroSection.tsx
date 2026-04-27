import Link from "next/link";
import { ChevronLeft, User } from "lucide-react";

import ClubHeroCarousel from "@/components/features/clubs/details/ClubHeroCarousel";

import type { Club } from "@/components/features/clubs/types";

type HeroSectionProps = {
    club: Club;
};

const HeroSection = ({ club }: HeroSectionProps) => {
    return (
        <section className="group relative flex flex-col w-full lg:bg-card lg:rounded-2xl lg:shadow-sm lg:overflow-hidden lg:justify-end lg:min-h-110 lg:cursor-pointer">
                <Link
                    href="/clubs"
                    className="lg:hidden absolute top-4 left-4 z-20 flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm text-black rounded-full shadow-sm active:scale-95 transition-transform"
                    aria-label="戻る"
                >
                    <ChevronLeft size={24} className="pr-0.5" />
                </Link>

                <div className="w-full h-70 md:h-100 lg:absolute lg:inset-0 lg:h-full z-0">
                    <ClubHeroCarousel
                        images={club.imgUrl}
                        clubName={club.name}
                    />
                </div>

                <div className="pointer-events-none hidden lg:block absolute inset-0 bg-blue-600/50 mix-blend-multiply z-0 transition-opacity duration-300 group-hover:opacity-0" />
                <div className="pointer-events-none hidden lg:block absolute inset-0 bg-linear-to-r from-blue-900/80 to-transparent z-0 transition-opacity duration-300 group-hover:opacity-0" />

                <div className="relative z-10 pt-6 pb-6 px-6 lg:p-12 bg-background lg:bg-transparent -mt-6 lg:mt-0 rounded-t-3xl lg:rounded-none lg:text-white transition-opacity duration-300 lg:group-hover:opacity-0 lg:pointer-events-none">
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
                            {club.status === "募集中"
                                ? "✨ 募集中"
                                : "募集終了"}
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
    );
};

export default HeroSection;