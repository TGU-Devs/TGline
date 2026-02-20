import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

const ReturnSettingsBtn = () => {
    const router = useRouter();
    return (
        <button className="mt-6 mb-6 text-lg text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-2 cursor-pointer" onClick={() => router.push("/settings")}>
            <ArrowLeft size={20} />
            設定に戻る
        </button>
    )
}

export default ReturnSettingsBtn;