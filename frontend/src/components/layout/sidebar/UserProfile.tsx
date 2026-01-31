import { SquarePen } from "lucide-react";

const currentUser = {
    id: "taro_1225",
    name: "たろう",
};

const UserProfile = () => {
    return (
        <div className="text-center border-b border-gray-200">
            <div className="p-4">
                <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                    {currentUser.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {currentUser.name}
                </h2>
                <button className="flex items-center justify-center w-full p-3 bg-purple-600 text-white font-medium rounded-3xl cursor-pointer hover:bg-purple-700 transition-colors">
                    <SquarePen className="w-5 h-5 mr-2" />
                    新規投稿
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
