import { Button } from "@/components/ui/button";

type NextPageButtonProps = {
    page: number;
    fetchNotifications: (page: number) => void;
    isLoadingMore: boolean;
};

const NextPageButton = ({ page, fetchNotifications, isLoadingMore }: NextPageButtonProps) => {
    return (
        <div className="flex justify-center pt-4">
            <Button
                variant="outline"
                onClick={() => fetchNotifications(page + 1)}
                disabled={isLoadingMore}
            >
                {isLoadingMore ? "読み込み中..." : "もっと読む"}
            </Button>
        </div>
    );
};

export default NextPageButton;