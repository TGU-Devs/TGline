import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ExternalSite } from "./types";

type ExternalContentProps = {
    site: ExternalSite;
};

const ExternalContent = ({ site }: ExternalContentProps) => {
    return (
        <Link
            key={site.url}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 flex flex-col"
        >
            <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${site.iconClass}`}
            >
                <site.icon size={24} />
            </div>
            <div className="flex-1">
                <div className="text-xs font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    {site.category}
                </div>
                <h3 className="text-lg font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    {site.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {site.description}
                </p>
            </div>
            <div className="flex items-center text-primary text-sm font-bold gap-1 mt-auto">
                サイトへ移動
                <ExternalLink
                    size={16}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
            </div>
        </Link>
    );
};

export default ExternalContent;
