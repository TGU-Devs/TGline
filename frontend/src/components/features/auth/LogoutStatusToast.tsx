"use client";

import { CircleCheck } from "lucide-react";

import { useStatusToast } from "@/hooks/useStatusToast";
import Toast from "@/components/ui/Toast";

const LogoutStatusToast = () => {
    const { showToast, message } = useStatusToast("/", {
        logged_out: { message: "ログアウトしました" },
    });

    return (
        <Toast
            showToast={showToast}
            icon={CircleCheck}
            message={message}
            bg="bg-emerald-500"
        />
    );
};

export default LogoutStatusToast;
