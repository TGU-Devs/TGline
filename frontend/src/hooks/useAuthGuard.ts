"use client";

import { useCallback, useEffect, useState } from "react";

import { useUser } from "@/contexts/UserContext";

export const useAuthGuard = () => {
    const { user, isLoading, setUser } = useUser();
    const [showLoginModal, setShowLoginModal] = useState(false);

    const isAuthenticated = isLoading ? null : Boolean(user);

    useEffect(() => {
        if (isAuthenticated === false) {
            setShowLoginModal(true);
        }
    }, [isAuthenticated]);

    const openLoginModal = useCallback(() => setShowLoginModal(true), []);
    const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

    const markUnauthenticated = useCallback(() => {
        setUser(null);
        setShowLoginModal(true);
    }, [setUser]);

    const requireAuth = useCallback(() => {
        if (isAuthenticated === true) return true;
        if (isAuthenticated === false) setShowLoginModal(true);
        return false;
    }, [isAuthenticated]);

    return {
        isAuthenticated,
        showLoginModal,
        openLoginModal,
        closeLoginModal,
        requireAuth,
        markUnauthenticated,
    };
};
