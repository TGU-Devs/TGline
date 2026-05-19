import Link from "next/link";
import Image from "next/image";

import { Users, Clock, MapPin } from "lucide-react";

import { Club } from "@/components/features/clubs/types";

type ClubsSectionProps = {
    clubs: Club[];
};

const ClubsList = ({ clubs }: ClubsSectionProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-6 mt-8">
            {clubs.map((club) => (
                <Link
                    href={`/clubs/${club.slug}`}
                    key={club.slug}
                    className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all group"
                >
                    <div className="relative h-60 bg-primary-foreground flex items-center justify-center overflow-hidden lg:h-70">
                        <Image
                            src={club.imgUrl.logo}
                            alt={`${club.name}の画像`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105" 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />

                        <div className="absolute top-4 left-4">
                            <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${club.category === "部活動" ? "bg-red-500" : club.category === "サークル・同好会" ? "bg-blue-500" : "bg-green-500"} text-white`}
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

                    <div className="p-6">
                        <h3 className="text-xl font-black text-foreground mb-3 group-hover:text-primary transition-colors">
                            {club.name}
                        </h3>
                        <p className="text-sm text-muted-foreground/90 leading-relaxed mb-6 line-clamp-2">
                            {club.shortDescription}
                        </p>

                        <div className="space-y-3 pt-4 border-t border-sidebar-border/20">
                            <div className="flex items-center gap-3 text-muted-foreground/70">
                                <Users size={16} className="text-primary" />
                                <span className="text-xs font-bold">
                                    {club.members}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground/70">
                                <MapPin size={16} className="text-primary" />
                                <span className="text-xs font-bold">
                                    {club.location}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground/70">
                                <Clock size={16} className="text-primary" />
                                <span className="text-xs font-bold">
                                    {club.schedule}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ClubsList;
