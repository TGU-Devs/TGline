import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type TopButtonProps = {
    searchParams: URLSearchParams;
    message: string;
};

const TopButton = ({ searchParams, message }: TopButtonProps) => {
    return (
        <Button
          asChild
          variant="ghost"
          className="mb-4 sm:mb-6 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/posts?${searchParams.toString()}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {message}
          </Link>
        </Button>
    );
}

export default TopButton;