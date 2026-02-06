"use client";

import { DoorOpen } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
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
                className="flex items-center justify-center w-full p-3 text-slate-700 font-medium rounded-3xl cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={handleLogout}
                disabled={isLoading}
            >
                <DoorOpen className="w-5 h-5 mr-2" />
                {isLoading ? "ログアウト中..." : "ログアウト"}
            </button>
        </div>
    );
};

export default LogoutButton;