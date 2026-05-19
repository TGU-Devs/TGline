import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const BackButton = () => {
    return (
        <div className="hidden lg:block mb-4">
            <Link
                href="/clubs"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                <ChevronLeft size={16} />
                サークル一覧に戻る
            </Link>
        </div>
    );
};

export default BackButton;
