const OfficeHours = () => {
    return (
        <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground border-l-4 border-primary pl-2 mb-4">
                学生部窓口利用時間
            </h2>
            <div className="overflow-x-auto border border-border rounded-lg shadow-sm bg-card">
                <table className="w-full text-sm text-center border-collapse min-w-max">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="py-3 px-4 font-medium text-foreground border-r border-border w-1/4 whitespace-nowrap">
                                キャンパス
                            </th>
                            <th className="py-3 px-4 font-medium text-foreground border-r border-border w-1/4 whitespace-nowrap">
                                窓口利用時間帯
                            </th>
                            <th className="py-3 px-4 font-medium text-foreground w-1/2 whitespace-nowrap">
                                備考
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-4 px-4 border-r border-border text-foreground leading-relaxed whitespace-nowrap">
                                土樋キャンパス
                                <br />
                                五橋キャンパス
                            </td>
                            <td className="py-4 px-4 border-r border-border text-foreground whitespace-nowrap">
                                8:30〜17:00
                            </td>
                            <td className="py-4 px-4 text-foreground">
                                窓口閉鎖時間帯（礼拝時間） <br />
                                10:15〜10:45
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OfficeHours;
