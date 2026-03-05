"use client";

import { MessageSquare, ExternalLink } from "lucide-react";

const GOOGLE_FORM_URL = "https://forms.gle/xHNi1hotjP1iBtae8";

const ContactPage = () => {
    return (
        <main className="min-h-screen bg-background p-6 md:p-10 duration-300">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <MessageSquare className="w-7 h-7 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">
                        お問い合わせ・ご意見
                    </h1>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        TGlineをご利用いただきありがとうございます。
                        <br />
                        不具合の報告や機能のリクエスト、その他ご意見など、
                        お気軽にお寄せください。
                    </p>

                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-foreground">
                            お問い合わせ内容の例
                        </h2>
                        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                            <li>アプリの不具合・エラーの報告</li>
                            <li>新しい機能の提案・リクエスト</li>
                            <li>使い方に関するご質問</li>
                            <li>その他ご意見・ご感想</li>
                        </ul>
                    </div>

                    <a
                        href={GOOGLE_FORM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity"
                    >
                        フォームを開く
                        <ExternalLink className="w-4 h-4" />
                    </a>

                    <p className="text-xs text-muted-foreground">
                        ※ Google フォームが開きます。回答は匿名で送信されます。
                    </p>
                </div>
            </div>
        </main>
    );
};

export default ContactPage;
