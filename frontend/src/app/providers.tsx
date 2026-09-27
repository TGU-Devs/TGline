"use client";

import { UserProvider } from "@/contexts/UserContext";
import { UnreadCountProvider } from "@/components/features/notifications/UnreadCountContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <UnreadCountProvider>{children}</UnreadCountProvider>
        </UserProvider>
    );
}
