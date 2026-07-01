import Link from "next/link";
import BackButton from "@/components/features/posts/components/shared/BackButton";
import { Settings } from "lucide-react";

type UserPageHeaderProps = {
    backUrl: string;
    backLabel: string;
    isOwnProfile: boolean;
    userId: string;
};

const UserPageHeader = ({ backUrl, backLabel, isOwnProfile, userId }: UserPageHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <BackButton fallbackUrl={backUrl} label={backLabel} />
            {isOwnProfile && (
                <div>
                    <Link
                        href={`/settings?from=profile&userId=${userId}`}
                        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-full"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">プロフィールを編集</span>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default UserPageHeader;