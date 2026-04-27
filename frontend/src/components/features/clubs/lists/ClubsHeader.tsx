import Header from "@/components/ui/PageHeader";

type ClubsHeaderProps = {
    activeStatus: string;
    setActiveStatus: (status: string) => void;
};

const statuses = ["すべて", "募集中", "締め切り"];

const ClubsHeader = ({ activeStatus, setActiveStatus }: ClubsHeaderProps) => {
    return (
        <div className="flex flex-col  md:flex-row justify-between md:items-center md:gap-4">
            <Header
                title="サークル・部活動"
                description="東北学院大学サークル・部活動一覧"
            />

            <div className="flex items-center bg-destructive-foreground p-1 rounded-full border border-border-200 shadow-sm w-fit">
                {statuses.map((status) => (
                    <button
                        key={status}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                            activeStatus === status
                                ? "bg-foreground text-destructive-foreground shadow-sm"
                                : "text-muted-foreground/50 hover:text-muted-foreground/90 hover:bg-muted/40"
                        }`}
                        onClick={() => setActiveStatus(status)}
                    >
                        {status}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ClubsHeader;