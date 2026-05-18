"use client";

import { useEffect, useState, use } from "react";
import { User as UserIcon } from "lucide-react";

import Loading from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/ErrorUI";

type UserProfile = {
    id: number;
    display_name: string;
    description: string | null;
    created_at: string;
};

const UserProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = use(params);

    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/users/${resolvedParams.id}`);

                if (!response.ok) {
                    throw new Error("ユーザー情報の取得に失敗しました");
                }

                const data = await response.json();
                setUser(data);

            } catch (err) {
                setError(err instanceof Error ? err.message : "ユーザー情報の取得中にエラーが発生しました");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [resolvedParams.id]);

    if (isLoading) {
        return <Loading />;
    }
    if (error) {
        if (error) return <ErrorUI error={error} fetch={() => window.location.reload()} />;
    }
    if (!user) {
        return <ErrorUI error="ユーザーが見つかりませんでした" fetch={() => window.location.reload()} />;
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-10">
                    <div className="flex flex-col items-center text-center space-y-4">
                        {/* アバターアイコン */}
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserIcon className="h-12 w-12 text-primary" />
                        </div>
                        
                        {/* ユーザー名・登録日 */}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {user.display_name || "匿名ユーザー"}
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                登録日: {new Date(user.created_at).toLocaleDateString("ja-JP")}
                            </p>
                        </div>

                        {/* 自己紹介文 */}
                        <div className="w-full text-left mt-6 pt-6 border-t border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-800 mb-3">自己紹介</h2>
                            {user.description ? (
                                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                    {user.description}
                                </p>
                            ) : (
                                <p className="text-slate-400 italic">自己紹介はまだ設定されていません</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;
