import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type TopButtonProps = {
    url: string;
    searchParams: URLSearchParams;
    message: string;
};

const TopButton = ({ url, searchParams, message }: TopButtonProps) => {
    return (
        <Button
          asChild
          variant="ghost"
          className="mb-4 sm:mb-6 text-muted-foreground hover:text-foreground"
        >
          <Link href={`${url}?${searchParams.toString()}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {message}
          </Link>
        </Button>
    );
}

export default TopButton;