"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserProvider, useUser } from "@/contexts/UserContext";
import Header from "@/components/layout/sidebar/Header";
import Sidebar from "@/components/layout/sidebar";

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null,
    );

    useEffect(() => {
        // 認証状態をチェック
        fetch("/api/users/me", { credentials: "include" })
            .then(async (res) => {
                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    // トークンが無効な場合、cookieを削除してからリダイレクト
                    await fetch("/api/users/sign_out", {
                        method: "DELETE",
                        credentials: "include",
                    });
                    setIsAuthenticated(false);
                    router.push("/login");
                }
            })
            .catch(() => {
                setIsAuthenticated(false);
                router.push("/login");
            });
    }, [router]);

    // ローディング中
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">読み込み中...</p>
                </div>
            </div>
        );
    }

    // 未認証の場合はリダイレクト（何も表示しない）
    if (!isAuthenticated) {
        return null;
    }

    // 認証済みの場合は子コンポーネントを表示
    return (
        <UserProvider>
            <div className="flex flex-col min-h-screen bg-white">
                <PrivateLayoutHeaderContent/>
                <div className="flex flex-1 bg-white">
                    <Sidebar />
                    <main className="flex-1 p-0 overflow-y-auto bg-slate-50 [&>*]:mt-0 [&>*]:pt-0">
                        {children}
                    </main>
                </div>
            </div>
        </UserProvider>
    );
}

function PrivateLayoutHeaderContent() {
    const { user: currentUser, isLoading } = useUser();
    return <Header currentUser={currentUser} isLoading={isLoading} />;
}
