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
          <h1 className="text-2xl font-bold text-foreground mb-6">プライバシーポリシー</h1>
          <p className="text-sm text-muted-foreground mb-8">最終更新日: 2026年4月15日</p>

          <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
            <p>
              TGline運営チーム（以下「運営」）は、本サービスにおける利用者の個人情報の取り扱いについて、
              以下のとおりプライバシーポリシーを定めます。
            </p>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. 収集する情報</h2>
              <h3 className="font-semibold text-foreground mb-2">利用者が提供する情報</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>メールアドレス</li>
                <li>表示名（ユーザー名）</li>
                <li>パスワード（ハッシュ化して保存）</li>
                <li>投稿内容（テキスト）</li>
                <li>Google認証情報（Google OAuthを利用した場合）</li>
              </ul>
              <h3 className="font-semibold text-foreground mb-2">自動的に収集する情報</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>IPアドレス</li>
                <li>ブラウザの種類・バージョン</li>
                <li>アクセス日時</li>
                <li>Cookie情報（認証トークンの管理に使用）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. 利用目的</h2>
              <p className="mb-2">収集した情報は、以下の目的で利用します。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>本サービスの提供・運営</li>
                <li>アカウントの管理・認証</li>
                <li>サービスの改善・品質向上</li>
                <li>利用規約違反への対応</li>
                <li>重要なお知らせの通知</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. Cookieの使用</h2>
              <p>
                本サービスでは、認証状態の維持のためにCookie（httpOnly Cookie）を使用しています。
                このCookieにはJWTトークンが含まれ、ログイン状態の管理に使用されます。
                ブラウザの設定でCookieを無効にした場合、本サービスの一部機能が利用できなくなります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. 第三者への提供</h2>
              <p className="mb-2">
                運営は、以下の場合を除き、利用者の個人情報を第三者に提供することはありません。
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>法令に基づく開示請求があった場合</li>
                <li>利用者本人の同意がある場合</li>
                <li>人の生命、身体または財産の保護のために必要な場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. 第三者サービスの利用</h2>
              <p className="mb-2">本サービスでは、以下の第三者サービスを利用しています。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <span className="font-medium">Google OAuth</span> — ソーシャルログイン機能の提供。
                  Googleアカウント情報（メールアドレス、表示名）を取得します。
                  Googleのプライバシーポリシーは
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">こちら</a>
                  をご確認ください。
                </li>
                <li>
                  <span className="font-medium">Railway</span> — サービスのホスティング基盤として利用。
                  データは Railway のインフラ上で処理・保管されます。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. データの保護方法</h2>
              <p className="mb-2">利用者の情報を保護するため、以下の対策を講じています。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>SSL/TLSによる通信の暗号化</li>
                <li>パスワードのハッシュ化（bcrypt）</li>
                <li>認証トークン（JWT）のhttpOnly Cookie管理</li>
                <li>環境変数による機密情報の管理</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. データの保管・保持期間</h2>
              <p>
                アカウントやコンテンツの削除は論理削除方式で管理されます。
                削除後もデータはデータベース上に保持されますが、サービス上では表示されなくなります。
                論理削除されたデータは、削除日から1年経過後に物理削除される場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. 利用者の権利</h2>
              <p className="mb-2">利用者は、自身の個人情報について以下の権利を有します。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>個人情報の開示を請求する権利</li>
                <li>個人情報の訂正・更新を請求する権利</li>
                <li>アカウントの削除を申請する権利</li>
              </ul>
              <p className="mt-2">
                これらの権利を行使する場合は、
                <a href="mailto:tguboard@gmail.com" className="text-primary hover:underline">tguboard@gmail.com</a>
                までご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">9. ポリシーの変更</h2>
              <p>
                運営は、必要に応じて本ポリシーを変更できるものとします。
                重要な変更がある場合は、本サービス内での通知またはメールでお知らせします。
                変更後も本サービスの利用を継続した場合、利用者は変更後のポリシーに同意��たものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">10. お問い合わせ</h2>
              <p>
                本ポリシーに関するお問い合わせは、下記までご連絡ください。
              </p>
              <p className="mt-2">
                TGline運営チーム<br />
                メール: <a href="mailto:tguboard@gmail.com" className="text-primary hover:underline">tguboard@gmail.com</a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                ※ 本プライバシーポリシーは学内プロジェクト用に作成されたものです。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
