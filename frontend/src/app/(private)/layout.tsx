"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

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
        <div className="lg:flex">
            <Sidebar />
            <main className="pt-16 min-h-screen lg:min-h-0 lg:flex-1 lg:pb-0 ">{children}</main>
        </div>
    );
}
