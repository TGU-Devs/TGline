"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";

import { apiFetch } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";

type UnreadCountContextType = {
    unreadCount: number;
    setUnreadCount: Dispatch<SetStateAction<number>>;
};

const UnreadCountContext = createContext<UnreadCountContextType | undefined>(
    undefined,
);

export const UnreadCountProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { user, isLoading } = useUser();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await apiFetch("/api/notifications/unread_count");
            if (!res.ok) {
                setUnreadCount(0);
                return;
            }

            const data = await res.json();
            setUnreadCount(typeof data.count === "number" ? data.count : 0);
        } catch {
            setUnreadCount(0);
        }
    }, []);

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            setUnreadCount(0);
            return;
        }

        fetchUnreadCount();
    }, [user, isLoading, fetchUnreadCount]);

    return (
        <UnreadCountContext.Provider value={{ unreadCount, setUnreadCount }}>
            {children}
        </UnreadCountContext.Provider>
    );
};

export const useUnreadCount = () => {
    const context = useContext(UnreadCountContext);
    if (context === undefined) {
        throw new Error("useUnreadCount must be used within a UnreadCountProvider");
    }
    return context;
};
