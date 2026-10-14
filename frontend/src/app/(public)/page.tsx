import { Suspense } from "react";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import LogoutStatusToast from "@/components/features/auth/LogoutStatusToast";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            <Suspense fallback={null}>
                <LogoutStatusToast />
            </Suspense>
            <Navigation />
            <main>
                <HeroSection />
            </main>
        </div>
    );
}
