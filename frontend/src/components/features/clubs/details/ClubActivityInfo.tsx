import { MapPin, Calendar, JapaneseYen, Users } from "lucide-react";

type ClubActivityInfoProps = {
    location: string;
    schedule: string;
    costs: string;
    GenderRatio: {
        male: number;
        female: number;
    };
};

const ClubActivityInfo = ({ location, schedule, costs, GenderRatio }: ClubActivityInfoProps) => {
    return (
        <section className="bg-card p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 pl-4 border-l-4 border-blue-500">
                            活動情報
                        </h2>

                        <ul className="flex flex-col">
                            <li className="flex flex-col lg:flex-row items-start py-4 border-b border-border">
                                <div className="flex items-center gap-3 w-40 shrink-0">
                                    <span className="p-2 rounded-full bg-blue-100 text-blue-600">
                                        <MapPin size={20} />
                                    </span>
                                    <p className="font-medium">活動場所</p>
                                </div>
                                <span className="text-muted-foreground whitespace-pre-wrap pt-1">
                                    {location}
                                </span>
                            </li>

                            <li className="flex flex-col lg:flex-row items-start py-4 border-b border-border">
                                <div className="flex items-center gap-3 w-40 shrink-0">
                                    <span className="p-2 rounded-full bg-green-100 text-green-600">
                                        <Calendar size={20} />
                                    </span>
                                    <p className="font-medium">活動日時</p>
                                </div>
                                <span className="text-muted-foreground whitespace-pre-wrap pt-1">
                                    {schedule}
                                </span>
                            </li>

                            <li className="flex flex-col lg:flex-row items-start py-4 border-b border-border">
                                <div className="flex items-center gap-3 w-40 shrink-0">
                                    <span className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                                        <JapaneseYen size={20} />
                                    </span>
                                    <p className="font-medium">費用</p>
                                </div>
                                <span className="text-muted-foreground whitespace-pre-wrap pt-1">
                                    {costs}
                                </span>
                            </li>

                            <li className="flex flex-col lg:flex-row items-start py-4 border-b border-border">
                                <div className="flex items-center gap-3 w-40 shrink-0">
                                    <span className="p-2 rounded-full bg-purple-100 text-purple-600">
                                        <Users size={20} />
                                    </span>
                                    <p className="font-medium">男女比</p>
                                </div>

                                <div className="w-full">
                                    <span className="text-muted-foreground block mb-2">
                                        男性：{GenderRatio.male}%　女性：
                                        {GenderRatio.female}%
                                    </span>
                                    <div className="h-2 w-full rounded-full overflow-hidden bg-gray-200 flex">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{
                                                width: `${GenderRatio.male}%`,
                                            }}
                                        />
                                        <div
                                            className="h-full bg-pink-400"
                                            style={{
                                                width: `${GenderRatio.female}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </section>
    );
};

export default ClubActivityInfo;