"use client";

import { useRouter } from "next/navigation";

import BackSkeleton from "@/components/features/notifications/BackSkeleton";
import MainContent from "@/components/features/notifications/MainContent";

const NotificationsPage = () => {
    const router = useRouter();

    const skeletonCount = 6;

    const clickHandler = () => {
        router.push("/posts");
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden -mt-16">
            <BackSkeleton skeletonCount={skeletonCount} />
            <MainContent clickHandler={clickHandler} />
        </div>
    );
};

export default NotificationsPage;
