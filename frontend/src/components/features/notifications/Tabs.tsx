import type { FilterTab, Tab } from "@/components/features/notifications/types";

type TabsProps = {
    tabs: Tab[];
    activeTab: FilterTab;
    setActiveTab: (tabId: FilterTab) => void;
};

const Tabs = ({ tabs, activeTab, setActiveTab }: TabsProps) => {
    return (
        <div className="mb-6 inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === tab.id
                            ? "bg-white text-sky-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    {tab.label}
                    <span
                        className={`min-w-5 px-1.5 rounded-full text-[11px] font-bold ${activeTab === tab.id
                                ? "bg-sky-100 text-sky-600"
                                : "bg-slate-200 text-slate-500"
                            }`}
                    >
                        {tab.count}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default Tabs;