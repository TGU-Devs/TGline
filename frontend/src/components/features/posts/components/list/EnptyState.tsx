import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type EnptyStateProps = {
    isAuthenticated: boolean;
    searchParams: URLSearchParams;
    setShowLoginModal: (show: boolean) => void;
};


const EnptyState = ({ isAuthenticated, searchParams, setShowLoginModal }: EnptyStateProps) => {
    return (
        <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-foreground text-lg font-medium mb-2">まだ投稿がありません</p>
            <p className="text-muted-foreground text-sm mb-6">最初の投稿を作成して、みんなと情報を共有しましょう</p>
            {isAuthenticated ? (
              <Button asChild>
                <Link href={`/posts/new?${searchParams.toString()}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  最初の投稿を作成
                </Link>
              </Button>
            ) : (
              <Button onClick={() => setShowLoginModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                最初の投稿を作成
              </Button>
            )}
          </div>
    );
};

export default EnptyState;