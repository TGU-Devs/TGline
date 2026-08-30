"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import type { User } from "@/types/user";
import { apiFetch } from "@/lib/api";

type UserContextType = {
    user: User| null;
    isLoading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    setUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedRef = useRef(false);

    const fetchUser = useCallback(async () => {
        try {
            if (!hasLoadedRef.current) {
                setIsLoading(true);
            }
            const res = await apiFetch("/api/users/me", {
                credentials: "include",
                cache: "no-store",
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setError(null);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("UseContext:取得エラー", err);
            setError("ユーザー情報の取得に失敗しました");
        } finally {
            hasLoadedRef.current = true;
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, isLoading, error, refreshUser: fetchUser, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
