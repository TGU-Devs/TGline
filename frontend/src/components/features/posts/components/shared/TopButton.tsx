import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type TopButtonProps = {
    backUrl: string;
    message: string;
};

// ブラウザ履歴に依存すると、無関係な中間ページ（フォーム等）を経由した際に
// 意図しない戻り先になるため、常に計算済みのURL（backUrl）へ確実に遷移する。
// BackButton（プロフィール・設定画面）とも同じ方式に統一している。
const TopButton = ({ backUrl, message }: TopButtonProps) => {
    return (
        <Button
          asChild
          variant="ghost"
          className="mb-4 sm:mb-6 text-muted-foreground hover:text-foreground"
        >
          <Link href={backUrl}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {message}
          </Link>
        </Button>
    );
}

export default TopButton;