import { ArrowLeft } from "lucide-react";

const ReturnSettingsBtn = () => {
    return (
        <button className="mt-6 mb-6 text-lg text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-2 cursor-pointer">
            <ArrowLeft size={20} />
            設定に戻る
        </button>
    )
}

export default ReturnSettingsBtn;