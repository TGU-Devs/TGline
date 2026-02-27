"use client";

import { DoorOpen } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type LogoutButtonProps = {
    isDesktop?: boolean;
};

const LogoutButton = ({ isDesktop }: LogoutButtonProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/users/sign_out", {
                method: "DELETE",
                credentials: "include",
            });

            // 204 No Content または 200 OK の場合は成功
            if (response.ok || response.status === 204) {
                // ログアウト成功後、ログインページへリダイレクト
                router.push("/login");
            } else {
                console.error("ログアウトに失敗しました");
            }
        } catch (error) {
            console.error("ログアウトエラー:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-3">
            <button
                className={`flex items-center transition-colors ${isDesktop ? "justify-center w-full p-3 font-medium text-muted-foreground rounded-xl cursor-pointer hover:bg-muted " : "px-3 py-4 text-destructive hover:bg-destructive/10 rounded-lg"}`}
                onClick={handleLogout}
                disabled={isLoading}
            >
                <DoorOpen className={`${isDesktop ? "w-5 h-5 mr-2" : "mr-4"}`} />
                <span className={isDesktop ? "" : "text-xs font-medium"}>{isLoading ? "ログアウト中..." : "ログアウト"} </span>
            </button>
        </div>
    );
};

export default LogoutButton;