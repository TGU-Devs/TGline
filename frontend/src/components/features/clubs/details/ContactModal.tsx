import Link from "next/link";

import {
    X,
    SquareArrowOutUpRight,
    Instagram,
    Facebook,
    Mail,
    Globe,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

import type { Club } from "@/components/features/clubs/types";

type ContactModalProps = {
    isOpen: boolean;
    onClose: () => void;
    clubName: string;
    clubContact: Club["contact"];
};

const ContactModal = ({
    isOpen,
    onClose,
    clubName,
    clubContact,
}: ContactModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity cursor-pointer"
                onClick={onClose}
            />
            <div className="relative bg-card text-card-foreground rounded-2xl shadow-xl max-w-sm w-full overflow-hidden transform transition-all border border-border animate-fade-in">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h2 className="text-lg font-bold">お問い合わせ</h2>
                    <button
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted/80 cursor-pointer"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>
                <ul className="p-5 flex flex-col gap-3">
                    {clubContact?.instagram && (
                        <li>
                            <Link
                                href={clubContact.instagram.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between w-full gap-3 rounded-xl p-4 bg-muted/40 border border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:bg-blue-50/50 hover:border-blue-100 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Instagram
                                        size={18}
                                        className="shrink-0 text-foreground/80 transition-transform duration-200 group-hover:scale-110 group-hover:text-pink-600"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm leading-tight">
                                            Instagram
                                        </p>
                                        <span className="text-muted-foreground text-xs leading-tight truncate block mt-0.5">
                                            {clubContact.instagram.username}
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
                    {clubContact?.twitter && (
                        <li>
                            <Link
                                href={clubContact.twitter.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between w-full gap-3 rounded-xl p-4 bg-muted/40 border border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:bg-blue-50/50 hover:border-blue-100 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <FaXTwitter
                                        size={18}
                                        className="shrink-0 text-[17px] text-foreground/80 transition-transform duration-200 group-hover:scale-110 group-hover:text-foreground"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm leading-tight">
                                            X (旧Twitter)
                                        </p>
                                        <span className="text-muted-foreground text-xs leading-tight truncate block mt-0.5">
                                            {clubContact.twitter.username}
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
                    {clubContact?.facebook && (
                        <li>
                            <Link
                                href={clubContact.facebook.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between w-full gap-3 rounded-xl p-4 bg-muted/40 border border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:bg-blue-50/50 hover:border-blue-100 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Facebook
                                        size={18}
                                        className="shrink-0 text-foreground/80 transition-transform duration-200 group-hover:scale-110 group-hover:text-blue-600"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm leading-tight">
                                            Facebook
                                        </p>
                                        <span className="text-muted-foreground text-xs leading-tight truncate block mt-0.5">
                                            {clubContact.facebook.username}
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
                    {clubContact?.email && (
                        <li>
                            <Link
                                href={`mailto:${clubContact.email}`}
                                className="flex items-center justify-between w-full gap-3 rounded-xl p-4 bg-muted/40 border border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:bg-blue-50/50 hover:border-blue-100 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Mail
                                        size={18}
                                        className="shrink-0 text-foreground/80 transition-transform duration-200 group-hover:scale-110 group-hover:text-amber-500"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm leading-tight">
                                            Email
                                        </p>
                                        <span className="text-muted-foreground text-xs leading-tight truncate block mt-0.5">
                                            {clubContact.email}
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
                    {clubContact?.website && (
                        <li>
                            <Link
                                href={clubContact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between w-full gap-3 rounded-xl p-4 bg-muted/40 border border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:bg-blue-50/50 hover:border-blue-100 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Globe
                                        size={18}
                                        className="shrink-0 text-foreground/80 transition-transform duration-200 group-hover:scale-110 group-hover:text-emerald-500"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm leading-tight">
                                            Website
                                        </p>
                                        <span className="text-muted-foreground text-xs leading-tight truncate block mt-0.5">
                                            {clubContact.website}
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
            </div>
        </div>
    );
};

export default ContactModal;
