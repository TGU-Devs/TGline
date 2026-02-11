import { SquarePen } from "lucide-react";
import Link from "next/link";

const currentUser = {
    id: "taro_1225",
    name: "たろう",
};

const UserProfile = () => {
    return (
        <div className="text-center border-b border-gray-200">
            <div className="p-4">
                <div className="w-20 h-20 bg-sky-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                    {currentUser.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                    {currentUser.name}
                </h2>
                <button className="flex items-center justify-center w-full p-3 bg-sky-600 text-white font-medium rounded-3xl cursor-pointer hover:bg-sky-700 transition-colors">
                    <SquarePen className="w-5 h-5 mr-2" />
                    <Link href="/posts/new">新規投稿</Link>
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
