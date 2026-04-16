import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorProps = {
    error?: string;
}

const ErrorUi = ({ error }: ErrorProps) => {
    const searchParams = useSearchParams();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "投稿が見つかりません"}</p>
          <Button asChild variant="outline">
            <Link href={`/posts?${searchParams.toString()}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              一覧に戻る
            </Link>
          </Button>
        </div>
      </div>
    );
}

export default ErrorUi;