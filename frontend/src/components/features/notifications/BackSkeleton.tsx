type BackSkeletonProps = {
    skeletonCount?: number;
};

const BackSkeleton = ({ skeletonCount }: BackSkeletonProps) => {
    const skeltonItems = [...Array(skeletonCount)];

    return (
        <div className="absolute inset-0 flex flex-col items-center pt-10 gap-4 pointer-events-none select-none opacity-40 blur-[3px]">
            {skeltonItems.map((_, index) => (
                <div
                    key={index}
                    className="w-full max-w-2xl bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4 opacity-60"
                >
                    <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
                    <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 bg-slate-200 rounded-full w-3/4"></div>
                        <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                    </div>
                    <div className="w-16 h-8 bg-slate-100 rounded-xl"></div>
                </div>
            ))}
        </div>
    );
};

export default BackSkeleton;
