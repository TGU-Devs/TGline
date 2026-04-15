# 利用規約・セキュリティポリシー Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新規登録画面に利用規約・セキュリティポリシーの同意チェックボックスと専用ページを追加する

**Architecture:** `(public)`ルートグループ配下に静的ページ2つを新規作成し、`AuthForm.tsx`にチェックボックスを追加してボタン制御を行う。バックエンド変更なし。

**Tech Stack:** Next.js 15 App Router, TailwindCSS 4, shadcn/ui, lucide-react

**Spec:** `docs/superpowers/specs/2026-04-15-terms-and-privacy-design.md`

---

### Task 1: 利用規約ページの作成

**Files:**
- Create: `frontend/src/app/(public)/terms/page.tsx`

- [ ] **Step 1: 利用規約ページを作成する**

```tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold text-foreground mb-6">利用規約</h1>
          <p className="text-sm text-muted-foreground mb-8">最終更新日: 2026年4月15日</p>

          <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第1条（サービスの目的）</h2>
              <p>
                TGline（以下「本サービス」）は、東北学院大学の学生・教職員・関係者が
                授業、就職活動、サークル活動等に関する情報を共有することを目的とした
                学内情報共有掲示板サービスです。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第2条（利用資格）</h2>
              <p>
                本サービスは、東北学院大学の学生、教職員、およびその関係者を対象としています。
                利用者は正確な情報を登録し、自身のアカウントを適切に管理する責任を負います。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第3条（禁止事項）</h2>
              <p className="mb-2">利用者は、以下の行為を行ってはなりません。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>他の利用者に対する誹謗中傷、ハラスメント行為</li>
                <li>個人情報の無断公開</li>
                <li>著作権・知的財産権を侵害する行為</li>
                <li>商用利用、広告、勧誘行為</li>
                <li>虚偽情報の意図的な投稿</li>
                <li>不正アクセス、システムへの攻撃行為</li>
                <li>法令または公序良俗に反する行為</li>
                <li>その他、運営が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第4条（投稿コンテンツの取り扱い）</h2>
              <p>
                利用者が投稿したコンテンツの著作権は、原則として投稿者に帰属します。
                ただし、運営は本サービスの提供・改善のために投稿コンテンツを利用できるものとします。
                運営が不適切と判断した投稿は、事前通知なく削除する場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第5条（アカウントの停止・削除）</h2>
              <p>
                本規約に違反した場合、運営は利用者のアカウントを事前通知なく
                停止または削除する場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第6条（免責事項）</h2>
              <p>
                運営は、本サービスの中断、変更、終了により生じた損害について
                一切の責任を負いません。利用者間のトラブルについても、
                運営は原則として関与しません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第7条（規約の変更）</h2>
              <p>
                運営は、必要に応じて本規約を変更できるものとします。
                変更後の規約は、本サービス内での通知をもって効力を生じます。
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                ※ 本利用規約は学内プロジェクト用のドラフトであり、法的拘束力を持つものではありません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 動作確認**

Run: `docker compose up` でフロントエンドを起動し、ブラウザで `http://localhost:3000/terms` にアクセス。
Expected: 利用規約ページが表示され、「新規登録に戻る」リンクが `/register` に遷移する。

- [ ] **Step 3: コミット**

```bash
git add frontend/src/app/\(public\)/terms/page.tsx
git commit -m "feat: add terms of service page"
```

---

### Task 2: セキュリティポリシーページの作成

**Files:**
- Create: `frontend/src/app/(public)/privacy/page.tsx`

- [ ] **Step 1: セキュリティポリシーページを作成する**

```tsx
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
```

- [ ] **Step 2: 動作確認**

Run: ブラウザで `http://localhost:3000/privacy` にアクセス。
Expected: セキュリティポリシーページが表示され、「新規登録に戻る」リンクが `/register` に遷移する。

- [ ] **Step 3: コミット**

```bash
git add frontend/src/app/\(public\)/privacy/page.tsx
git commit -m "feat: add privacy policy page"
```

---

### Task 3: 登録フォームにチェックボックスを追加

**Files:**
- Modify: `frontend/src/components/features/auth/AuthForm.tsx:66-70`（state追加）
- Modify: `frontend/src/components/features/auth/AuthForm.tsx:339-364`（チェックボックス・ボタン制御）

- [ ] **Step 1: `termsAccepted` stateを追加する**

`AuthForm.tsx`の既存state群（70行目付近）に追加:

```tsx
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [termsAccepted, setTermsAccepted] = useState(false);
```

意図: `showConfirmPassword`の直後に `termsAccepted` stateを追加する。初期値は `false`。

- [ ] **Step 2: パスワード確認欄の下にチェックボックスを追加する**

`AuthForm.tsx`の339行目（パスワード確認欄の閉じタグ `)}` の後、`{formErrors.main &&` の前）に以下を挿入:

```tsx
{isRegister && (
  <div className="flex items-start gap-2">
    <input
      type="checkbox"
      id="termsAccepted"
      checked={termsAccepted}
      onChange={(e) => setTermsAccepted(e.target.checked)}
      className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
    />
    <label htmlFor="termsAccepted" className="text-sm text-muted-foreground cursor-pointer">
      <a
        href="/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline font-medium"
      >
        利用規約
      </a>
      {" と "}
      <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline font-medium"
      >
        セキュリティポリシー
      </a>
      {" に同意する"}
    </label>
  </div>
)}
```

意図: 登録画面（`isRegister=true`）の場合のみチェックボックスを表示する。リンクは別タブで開く。

- [ ] **Step 3: 登録ボタンのdisabled条件を変更する**

`AuthForm.tsx`の345行目付近の `Button` コンポーネントを修正:

変更前:
```tsx
<Button className="w-full" type="submit" disabled={isLoading}>
```

変更後:
```tsx
<Button className="w-full" type="submit" disabled={isLoading || (isRegister && !termsAccepted)}>
```

意図: 登録画面でチェックボックスが未チェックの場合、登録ボタンをdisabledにする。ログイン画面では影響なし。

- [ ] **Step 4: GoogleLoginボタンをチェックボックスで制御する**

`AuthForm.tsx`の357行目付近のGoogleLogin部分を修正:

変更前:
```tsx
<div className="flex justify-center">
    <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => setFormErrors({ main: "Googleログインに失敗しました" })}
        text={isRegister ? "signup_with" : "signin_with"}
        width="100%"
    />
</div>
```

変更後:
```tsx
<div className={`flex justify-center ${isRegister && !termsAccepted ? "pointer-events-none opacity-50" : ""}`}>
    <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => setFormErrors({ main: "Googleログインに失敗しました" })}
        text={isRegister ? "signup_with" : "signin_with"}
        width="100%"
    />
</div>
```

意図: `GoogleLogin`コンポーネントにはnativeの`disabled` propがないため、親divの`pointer-events-none`と`opacity-50`で視覚的・操作的に無効化する。登録画面でチェック未チェック時のみ適用。

- [ ] **Step 5: 動作確認**

ブラウザで `http://localhost:3000/register` にアクセスし、以下を確認:
1. チェックボックスが表示されている
2. チェックなしの状態で「登録」ボタンがdisabled（グレーアウト）
3. チェックなしの状態でGoogleボタンがグレーアウトでクリック不可
4. チェックを入れると両ボタンが有効になる
5. 「利用規約」リンクが `/terms` に別タブで開く
6. 「セキュリティポリシー」リンクが `/privacy` に別タブで開く
7. `/login` ページではチェックボックスが表示されない

- [ ] **Step 6: コミット**

```bash
git add frontend/src/components/features/auth/AuthForm.tsx
git commit -m "feat: add terms acceptance checkbox to registration form"
```

---

### Task 4: ビルド確認

**Files:** なし（確認のみ）

- [ ] **Step 1: フロントエンドのビルドを実行する**

```bash
cd frontend && npm run build
```

Expected: ビルドが成功する。新規追加した`/terms`と`/privacy`ページが出力に含まれる。

- [ ] **Step 2: コミット（ビルドエラーがあった場合のみ修正してコミット）**

ビルドが成功すればこのステップはスキップ。エラーがあれば修正してコミットする。
