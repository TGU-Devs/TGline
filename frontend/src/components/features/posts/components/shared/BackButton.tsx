"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type BackButtonProps = {
    fallbackUrl?: string;
    label?: string;
    className?: string;
};

const BackButton = ({ fallbackUrl = "/posts", label = "戻る", className }: BackButtonProps) => {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push(fallbackUrl);
        }
    };

    return (
        <Button
            variant="ghost"
            onClick={handleBack}
            className={`mb-4 sm:mb-6 text-muted-foreground hover:text-foreground ${className}`}
        >
            <ArrowLeft className="h-5 w-5" />
            <span>{label}</span>
        </Button>
    );
};

export default BackButton;