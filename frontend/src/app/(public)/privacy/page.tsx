import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          新規登録に戻る
        </Link>

        <div className="bg-card/80 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-lg border border-border/50">
          <h1 className="text-2xl font-bold text-foreground mb-6">セキュリティポリシー</h1>
          <p className="text-sm text-muted-foreground mb-8">最終更新日: 2026年4月15日</p>

          <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. 収集する個人情報</h2>
              <p className="mb-2">本サービスでは、以下の個人情報を収集します。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>メールアドレス</li>
                <li>表示名（ユーザー名）</li>
                <li>投稿内容（テキスト）</li>
                <li>Google認証情報（Google OAuthを利用した場合）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. 利用目的</h2>
              <p className="mb-2">収集した個人情報は、以下の目的で利用します。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>本サービスの提供・運営</li>
                <li>アカウントの管理・認証</li>
                <li>サービスの改善・品質向上</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. 第三者への提供</h2>
              <p>
                法令に基づく場合を除き、利用者の個人情報を第三者に提供することはありません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. データの保護方法</h2>
              <p className="mb-2">利用者の情報を保護するため、以下の対策を講じています。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>SSL/TLSによる通信の暗号化</li>
                <li>パスワードのハッシュ化（bcrypt）</li>
                <li>認証トークン（JWT）のhttpOnly Cookie管理</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. データの保管</h2>
              <p>
                アカウントやコンテンツの削除は論理削除方式（deleted_atカラム）で管理されます。
                削除リクエスト後もデータはデータベース上に保持されますが、
                サービス上では表示されなくなります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. ユーザーの権利</h2>
              <p>
                利用者は、自身のアカウントの削除を申請することができます。
                削除を希望する場合は、運営チームまでご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. お問い合わせ</h2>
              <p>
                セキュリティポリシーに関するお問い合わせは、
                アプリ内の問い合わせ機能または運営チームまでご連絡ください。
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                ※ 本セキュリティポリシーは学内プロジェクト用のドラフトであり、法的拘束力を持つものではありません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
