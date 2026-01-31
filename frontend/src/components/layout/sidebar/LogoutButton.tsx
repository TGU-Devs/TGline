import { DoorOpen } from "lucide-react";

const LogoutButton = () => {
    return (
        <div className="p-3">
            <button className="flex items-center justify-center w-full p-3 text-gray-700 font-medium rounded-3xl cursor-pointer hover:bg-gray-200 transition-colors">
                <DoorOpen className="w-5 h-5 mr-2" />
                ログアウト
            </button>
        </div>
    );
};

export default LogoutButton;