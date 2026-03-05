import { HelpCircle } from "lucide-react";

const Help = () => {
    return (
        <div className="mt-12 p-6 bg-muted rounded-2xl border border-border">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <HelpCircle size={20} className="text-primary" />
                お困りの場合
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
                外部サイトのログイン情報（ユーザーIDやパスワード）に関するお問い合わせは、大学の教務課または情報処理センターへ直接ご確認ください。本アプリでは外部サイトのパスワード管理は行っておりません。
            </p>
        </div>
    );
};

export default Help;
