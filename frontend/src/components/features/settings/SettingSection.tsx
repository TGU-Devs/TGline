type SettingSectionProps = {
    title: string;
    icon: React.ComponentType<{ size: number }>;
    iconColor?: string;
    iconBgColor?: string;
    textcolor?: string;
    children: React.ReactNode;
}

const SettingSection = ({ title, icon: Icon, iconColor, iconBgColor, textcolor, children }: SettingSectionProps) => {
    return (
        <section className="rounded-3xl border bg-white border-slate-100 shadow-sm mb-6">
        <header className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconBgColor || "bg-sky-50"} ${iconColor || "text-sky-600"}`}>
                <Icon size={20} />
            </div>
            <h3 className={`font-bold text-lg ${textcolor || "text-slate-800"}`}>{title}</h3>
        </header>
        <div className="p-6">{children}</div>
    </section>
    );
}

export default SettingSection;