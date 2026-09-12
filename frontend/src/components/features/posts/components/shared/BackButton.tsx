"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type BackButtonProps = {
    fallbackUrl?: string;
    label?: string;
    className?: string;
    /** 遷移直前に呼ばれる。false を返すと遷移をキャンセルする（未保存確認など） */
    onBeforeNavigate?: (url: string) => boolean;
};

const BackButton = ({ fallbackUrl = "/posts", label = "戻る", className, onBeforeNavigate }: BackButtonProps) => {
    const router = useRouter();

    // ブラウザ履歴に依存すると、無関係な中間ページ（フォーム等）を経由した際に
    // 意図しない戻り先になるため、常に計算済みのURLへ確実に遷移する。
    const handleBack = () => {
        if (onBeforeNavigate && !onBeforeNavigate(fallbackUrl)) return;
        router.push(fallbackUrl);
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