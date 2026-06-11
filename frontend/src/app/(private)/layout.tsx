"use client";

import { useEffect } from "react";
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
    const { user, isLoading } = useUser();

    useEffect(() => {
        if (!isLoading && !user) {
            fetch("/api/users/sign_out", {
                method: "DELETE",
                credentials: "include",
            }).finally(() => {
                router.push("/login");
            });
        }
    }, [isLoading, router, user]);

    // ローディング中
    if (isLoading) {
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
    if (!user) {
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
