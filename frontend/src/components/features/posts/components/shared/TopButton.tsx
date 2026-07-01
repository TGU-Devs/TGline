"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type TopButtonProps = {
    backUrl: string;
    message: string;
};

const TopButton = ({ backUrl, message }: TopButtonProps) => {
    const router = useRouter();

    // ブラウザ履歴があればそれを優先して戻る（他画面のBackButtonと同じ方式に統一）。
    // ここで常にpush遷移をすると、履歴popで戻る他画面との間で無限ループになる。
    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push(backUrl);
        }
    };

    return (
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 sm:mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {message}
        </Button>
    );
}

export default TopButton;