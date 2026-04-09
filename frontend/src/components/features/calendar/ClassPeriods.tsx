type Row = {
    label: string;
    time: string;
    duration: string;
    note?: string;
    isBreak?: boolean;
};

const rows: Row[] = [
    { label: "1校時", time: "08:45〜10:15", duration: "90分" },
    { label: "礼拝", time: "10:15〜10:45", duration: "30分", note: "礼拝前後の移動時間を含む", isBreak: true },
    { label: "2校時", time: "10:45〜12:15", duration: "90分" },
    { label: "昼休み", time: "12:15〜13:15", duration: "60分", isBreak: true },
    { label: "3校時", time: "13:15〜14:45", duration: "90分" },
    { label: "移動/休憩", time: "14:45〜15:00", duration: "15分", isBreak: true },
    { label: "4校時", time: "15:00〜16:30", duration: "90分" },
    { label: "移動/休憩", time: "16:30〜16:45", duration: "15分", isBreak: true },
    { label: "5校時", time: "16:45〜18:15", duration: "90分" },
    { label: "移動/休憩", time: "18:15〜18:25", duration: "10分", note: "移動時間を10分に短縮", isBreak: true },
    { label: "6校時", time: "18:25〜19:55", duration: "90分", note: "大学院、補講、オンデマンド授業などを配置" },
    { label: "移動/休憩", time: "19:55〜20:05", duration: "10分", note: "移動時間を10分に短縮", isBreak: true },
    { label: "7校時", time: "20:05〜21:35", duration: "90分", note: "対面授業は開講せずオンデマンド授業を配置" },
];

const ClassPeriods = () => {
    return (
        <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground border-l-4 border-primary pl-2 mb-4">
                授業時間帯（土樋・五橋キャンパス共通）
            </h2>
            <div className="overflow-x-auto border border-border rounded-lg shadow-sm bg-card">
                <table className="w-full text-xs md:text-sm text-center border-collapse min-w-max">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="py-3 px-3 md:px-4 font-medium text-foreground border-r border-border whitespace-nowrap">
                                区分
                            </th>
                            <th className="py-3 px-3 md:px-4 font-medium text-foreground border-r border-border whitespace-nowrap">
                                授業時間帯
                            </th>
                            <th className="py-3 px-3 md:px-4 font-medium text-foreground border-r border-border whitespace-nowrap">
                                所要時間
                            </th>
                            <th className="py-3 px-3 md:px-4 font-medium text-foreground whitespace-nowrap">
                                備考
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr
                                key={`${row.label}-${idx}`}
                                className={`border-b border-border last:border-b-0 ${
                                    row.isBreak ? "bg-muted/30" : ""
                                }`}
                            >
                                <td className="py-3 px-3 md:px-4 border-r border-border text-foreground font-medium whitespace-nowrap">
                                    {row.label}
                                </td>
                                <td className="py-3 px-3 md:px-4 border-r border-border text-foreground whitespace-nowrap">
                                    {row.time}
                                </td>
                                <td className="py-3 px-3 md:px-4 border-r border-border text-foreground whitespace-nowrap">
                                    {row.duration}
                                </td>
                                <td className="py-3 px-3 md:px-4 text-foreground text-left md:text-center leading-relaxed">
                                    {row.note ?? ""}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClassPeriods;
