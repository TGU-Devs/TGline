import { useEffect, useState } from "react";

import type { CurrentUser } from "@/components/features/posts/types";

export const useCurrentUser = () => {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch("/api/users/me", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data);
            }
        } catch {
            // ignore
        } 
    };

    const isOwnerOrAdmin = (userId: number | undefined) => {
        if (!currentUser || !userId) return false;
        return userId === currentUser.id || currentUser.role === "admin";
    };

    return { isOwnerOrAdmin };
};
