import Main from "@/components/ui/PageMain";
import BackButton from "@/components/features/clubs/details/BackButton";

const NotFoundClub = () => {
    return (
        <Main padding="px-0 lg:p-12">
            <BackButton />
            <div className="flex flex-col items-center justify-center h-96">
                <h2 className="text-2xl font-bold mb-4">
                    サークルが見つかりません
                </h2>
                <p className="text-muted-foreground">
                    お探しのサークルは見つかりませんでした。
                </p>
            </div>
        </Main>
    );
};

export default NotFoundClub;
