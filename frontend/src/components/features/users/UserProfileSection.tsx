import Avatar from "boring-avatars";
import { Calendar } from "lucide-react";
import type { Post, Comment } from "@/components/features/posts/types";
import type { UserProfile } from "@/components/features/users/types";

type UserProfileSectionProps = {
    user: UserProfile;
    formattedDate: string;
    posts: Post[];
    comments: Comment[];
};

const UserProfileSection = ({
    user,
    formattedDate,
    posts,
    comments,
}: UserProfileSectionProps) => {
    return (
        <div className="bg-card rounded-3xl p-6 shadow-sm border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-4 flex-1">
                    <div className="flex items-start gap-6">
                        <div className="shrink-0 flex items-center justify-center rounded-full bg-blue-50/50 p-2">
                            <Avatar
                                name={user.display_name}
                                variant="beam"
                                size={80}
                            />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-xl font-bold">
                                {user.display_name}
                            </h1>

                            {/* 学部情報 */}
                            {/* <div>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
                                            学部・ダミー
                                        </span>
                                    </div> */}

                            <div className="flex items-center text-sm text-muted-foreground gap-1.5 font-medium">
                                <Calendar className="w-4 h-4" />
                                <span>{formattedDate}に登録</span>
                            </div>
                        </div>
                    </div>

                    {user.description ? (
                        <p className="text-sm text-foreground wrap-break-word">
                            {user.description}
                        </p>
                    ) : (
                        <p className="text-sm text-foreground/70 italic">
                            自己紹介がありません。
                        </p>
                    )}
                </div>

                <div className="flex gap-8 md:px-8 shrink-0 self-center">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold">
                            {posts.length}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium mt-1">
                            投稿
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold">
                            {comments.length}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium mt-1">
                            コメント
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileSection;
