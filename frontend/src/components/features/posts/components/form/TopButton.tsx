import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type TopButtonProps = {
    searchParams: URLSearchParams;
    newPost: boolean;
};

const TopButton = ({ searchParams, newPost }: TopButtonProps) => {
    return (
        <Button
          asChild
          variant="ghost"
          className="mb-4 sm:mb-6 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/posts?${searchParams.toString()}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {newPost ? "一覧に戻る" : "詳細に戻る"}
          </Link>
        </Button>
    );
}

export default TopButton;