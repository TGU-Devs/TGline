# パスワードリセット機能 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ユーザーがパスワードを忘れた際に、メール経由でパスワードをリセットできる機能を実装する

**Architecture:** Deviseの `:recoverable` モジュールでトークン生成・検証を行い、Resendでメール送信。フロントエンドは Next.js App Router で forgot-password / reset-password ページを追加し、BFFプロキシ経由でRails APIと通信する。

**Tech Stack:** Rails 7.2, Devise, Resend (resend gem), rack-attack, Next.js 15 (App Router), TypeScript

**Spec:** `docs/superpowers/specs/2026-03-25-password-reset-design.md`

---

## ファイル構成

### 新規作成

| ファイル | 責務 |
|----------|------|
| `backend/app/controllers/api/users/password_resets_controller.rb` | リセット要求・実行API |
| `backend/app/mailers/password_reset_mailer.rb` | Resendによるメール送信 |
| `backend/app/views/password_reset_mailer/reset_email.html.erb` | リセットメールテンプレート |
| `backend/app/views/password_reset_mailer/oauth_notification.html.erb` | OAuth案内メールテンプレート |
| `backend/config/initializers/resend.rb` | Resend初期化 |
| `backend/config/initializers/rack_attack.rb` | レートリミット設定 |
| `frontend/src/app/(auth)/forgot-password/page.tsx` | メールアドレス入力画面 |
| `frontend/src/app/(auth)/reset-password/page.tsx` | 新パスワード設定画面 |
| `frontend/src/app/api/users/password_reset/route.ts` | BFFプロキシ（POST/PATCH） |
| `frontend/src/lib/validators.ts` | パスワードバリデーション共通ユーティリティ |

### 変更

| ファイル | 変更内容 |
|----------|----------|
| `backend/Gemfile` | `resend`, `rack-attack` gem 追加 |
| `backend/config/routes.rb` | `password_reset` ルート追加 |
| `backend/app/models/user.rb` | パスワード強度カスタムバリデーション追加 |
| `frontend/src/middleware.ts` | `/forgot-password`, `/reset-password` をパブリックパスに追加 |
| `frontend/src/app/(auth)/login/page.tsx` | 「パスワードをお忘れですか？」リンク追加 |
| `frontend/src/app/(private)/settings/security/change-password/page.tsx` | 共通バリデーション利用に切り替え |

---

## Task 1: Backend — gem追加とセットアップ

**Files:**
- Modify: `backend/Gemfile`
- Create: `backend/config/initializers/resend.rb`
- Create: `backend/config/initializers/rack_attack.rb`

- [ ] **Step 1: Gemfileに `resend` と `rack-attack` を追加**

`backend/Gemfile` の `gem 'google-id-token'` の下（18行目の後）に追加:

```ruby
# Email delivery
gem 'resend'

# Rate limiting
gem 'rack-attack'
```

- [ ] **Step 2: bundle install 実行**

Run: `cd backend && bundle install`
Expected: `Bundle complete!` が表示される

- [ ] **Step 3: Resend初期化ファイルを作成**

`backend/config/initializers/resend.rb` を作成:

```ruby
# frozen_string_literal: true

Resend.api_key = ENV["RESEND_API_KEY"]
```

- [ ] **Step 4: rack-attack設定ファイルを作成**

`backend/config/initializers/rack_attack.rb` を作成:

```ruby
# frozen_string_literal: true

class Rack::Attack
  # パスワードリセット要求（POST）: 同一IPから5回/1時間
  throttle("password_reset_request/ip", limit: 5, period: 1.hour) do |req|
    req.ip if req.post? && req.path == "/api/users/password_reset"
  end

  # パスワードリセット実行（PATCH）: 同一IPから10回/1時間（トークンブルートフォース防止）
  throttle("password_reset_execute/ip", limit: 10, period: 1.hour) do |req|
    req.ip if req.patch? && req.path == "/api/users/password_reset"
  end

  # レートリミット超過時のレスポンス
  self.throttled_responder = lambda do |_req|
    [
      429,
      { "Content-Type" => "application/json" },
      [{ error: "リクエストが多すぎます。しばらく時間をおいてから再度お試しください。" }.to_json]
    ]
  end
end
```

- [ ] **Step 5: コミット**

```bash
git add backend/Gemfile backend/Gemfile.lock backend/config/initializers/resend.rb backend/config/initializers/rack_attack.rb
git commit -m "feat: resend, rack-attack gem追加とイニシャライザ設定"
```

---

## Task 2: Backend — Userモデルにパスワード強度バリデーション追加

**Files:**
- Modify: `backend/app/models/user.rb:16-19`

- [ ] **Step 1: Userモデルにカスタムバリデーションを追加**

`backend/app/models/user.rb` の既存バリデーション（16行目 `validates :display_name` の前）に追加:

```ruby
  # パスワード強度バリデーション（8文字以上、大文字・小文字・数字を含む）
  validate :password_complexity, if: :password_required?

  private

  def password_complexity
    return if password.blank?

    if password.length < 8
      errors.add(:password, "は8文字以上で入力してください")
    end

    unless password.match?(/[A-Z]/)
      errors.add(:password, "には大文字を含めてください")
    end

    unless password.match?(/[a-z]/)
      errors.add(:password, "には小文字を含めてください")
    end

    unless password.match?(/[0-9]/)
      errors.add(:password, "には数字を含めてください")
    end
  end

  public
```

**注意**: `private` / `public` の配置に注意。既存の `soft_delete`, `deleted?`, `admin?` メソッドは `public` のままにする。最終的なファイル構成:

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :posts, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :comments, dependent: :destroy

  def password_required?
    provider.blank? && super
  end

  # パスワード強度バリデーション
  validate :password_complexity, if: :password_required?

  validates :display_name, presence: true, length: { maximum: 20 }
  validates :role, presence: true, inclusion: { in: %w[user admin] }
  validates :description, length: { maximum: 200 }, allow_nil: true

  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }

  def soft_delete
    update(deleted_at: Time.current)
  end

  def deleted?
    deleted_at.present?
  end

  def admin?
    role == 'admin'
  end

  private

  def password_complexity
    return if password.blank?

    errors.add(:password, "は8文字以上で入力してください") if password.length < 8
    errors.add(:password, "には大文字を含めてください") unless password.match?(/[A-Z]/)
    errors.add(:password, "には小文字を含めてください") unless password.match?(/[a-z]/)
    errors.add(:password, "には数字を含めてください") unless password.match?(/[0-9]/)
  end
end
```

- [ ] **Step 2: Rails consoleでバリデーション確認**

Run: `cd backend && rails runner "u = User.new(display_name: 'test', email: 'test@test.com', role: 'user', password: 'weak'); puts u.valid?; puts u.errors.full_messages"`
Expected: `false` と パスワード強度エラーメッセージが表示される

Run: `cd backend && rails runner "u = User.new(display_name: 'test', email: 'test@test.com', role: 'user', password: 'StrongPass1'); puts u.valid?; puts u.errors.full_messages"`
Expected: `true`（メールの重複がなければ）

- [ ] **Step 3: コミット**

```bash
git add backend/app/models/user.rb
git commit -m "feat: Userモデルにパスワード強度バリデーション追加"
```

---

## Task 3: Backend — PasswordResetMailer作成

**Files:**
- Create: `backend/app/mailers/password_reset_mailer.rb`
- Create: `backend/app/views/password_reset_mailer/reset_email.html.erb`
- Create: `backend/app/views/password_reset_mailer/oauth_notification.html.erb`

- [ ] **Step 1: PasswordResetMailerを作成**

`backend/app/mailers/password_reset_mailer.rb`:

```ruby
# frozen_string_literal: true

class PasswordResetMailer < ApplicationMailer
  layout false
  default from: ENV.fetch("MAILER_FROM_ADDRESS", "noreply@tgu-board.example.com")

  def reset_email(user, raw_token)
    @user = user
    @reset_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=#{raw_token}"
    @expires_in = "6時間"

    mail(to: @user.email, subject: "パスワードリセットのご案内")
  end

  def oauth_notification(user)
    @user = user
    @login_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3000')}/login"

    mail(to: @user.email, subject: "ログイン方法のご案内")
  end
end
```

- [ ] **Step 2: リセットメールテンプレートを作成**

`backend/app/views/password_reset_mailer/reset_email.html.erb`:

```erb
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; padding: 20px; color: #333;">
  <h2>パスワードリセットのご案内</h2>

  <p><%= @user.display_name %> さん</p>

  <p>パスワードリセットのリクエストを受け付けました。</p>
  <p>以下のリンクをクリックして、新しいパスワードを設定してください。</p>

  <p style="margin: 24px 0;">
    <a href="<%= @reset_url %>"
       style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
      パスワードをリセットする
    </a>
  </p>

  <p>このリンクは<strong><%= @expires_in %></strong>以内に有効です。</p>

  <p style="color: #666; font-size: 14px;">
    このメールに心当たりがない場合は、無視してください。パスワードは変更されません。
  </p>
</body>
</html>
```

- [ ] **Step 3: OAuth案内メールテンプレートを作成**

`backend/app/views/password_reset_mailer/oauth_notification.html.erb`:

```erb
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; padding: 20px; color: #333;">
  <h2>ログイン方法のご案内</h2>

  <p><%= @user.display_name %> さん</p>

  <p>パスワードリセットのリクエストを受け付けましたが、このアカウントはGoogleアカウントで登録されています。</p>
  <p>ログインページからGoogleログインをご利用ください。</p>

  <p style="margin: 24px 0;">
    <a href="<%= @login_url %>"
       style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
      ログインページへ
    </a>
  </p>

  <p style="color: #666; font-size: 14px;">
    このメールに心当たりがない場合は、無視してください。
  </p>
</body>
</html>
```

- [ ] **Step 4: コミット**

```bash
git add backend/app/mailers/password_reset_mailer.rb backend/app/views/password_reset_mailer/
git commit -m "feat: パスワードリセット用メーラーとテンプレート追加"
```

---

## Task 4: Backend — PasswordResetsController作成

**Files:**
- Create: `backend/app/controllers/api/users/password_resets_controller.rb`
- Modify: `backend/config/routes.rb:18-27`

- [ ] **Step 1: PasswordResetsControllerを作成**

`backend/app/controllers/api/users/password_resets_controller.rb`:

```ruby
# frozen_string_literal: true

module Api
  module Users
    # パスワードリセット（リセット要求・リセット実行）用コントローラー
    class PasswordResetsController < ApplicationController
      # 未認証ユーザーが利用するため認証をスキップ
      skip_before_action :authenticate_user!

      # POST /api/users/password_reset
      # パスワードリセット要求（メール送信）
      def create
        user = User.active.find_by(email: create_params[:email])

        if user.present?
          if user.provider.present?
            # OAuthユーザーにはGoogleログイン案内メールを送信
            PasswordResetMailer.oauth_notification(user).deliver_now
          else
            # 通常ユーザーにはリセットトークンを生成してメール送信
            raw_token, enc_token = Devise.token_generator.generate(User, :reset_password_token)
            user.update!(
              reset_password_token: enc_token,
              reset_password_sent_at: Time.current
            )
            PasswordResetMailer.reset_email(user, raw_token).deliver_now
          end
        end

        # アカウント列挙防止のため、常に同じレスポンスを返す
        render json: { message: "メールを送信しました" }, status: :ok
      rescue StandardError => e
        Rails.logger.error("Password reset email error: #{e.message}")
        render json: { message: "メールを送信しました" }, status: :ok
      end

      # PATCH /api/users/password_reset
      # パスワードリセット実行（トークン検証 + パスワード更新）
      def update
        user = User.reset_password_by_token(
          reset_password_token: update_params[:reset_password_token],
          password: update_params[:password],
          password_confirmation: update_params[:password_confirmation]
        )

        if user.errors.empty?
          # リセット成功: JWTトークン発行して自動ログイン
          token = JwtService.encode(user.id)

          cookies[:jwt_token] = {
            value: token,
            httponly: true,
            secure: Rails.env.production?,
            same_site: :lax,
            expires: 7.days.from_now
          }

          render json: {
            user: {
              id: user.id,
              email: user.email,
              display_name: user.display_name,
              role: user.role
            },
            token: token
          }, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def create_params
        params.require(:password_reset).permit(:email)
      end

      def update_params
        params.require(:password_reset).permit(:reset_password_token, :password, :password_confirmation)
      end
    end
  end
end
```

- [ ] **Step 2: ルーティングを追加**

`backend/config/routes.rb` の `namespace :users do` ブロック内（25行目 `patch "password"` の後）に追加:

```ruby
      post "password_reset", to: "password_resets#create"
      patch "password_reset", to: "password_resets#update"
```

- [ ] **Step 3: ルーティング確認**

Run: `cd backend && rails routes | grep password_reset`
Expected:
```
api_users_password_reset POST   /api/users/password_reset(.:format)  api/users/password_resets#create
                         PATCH  /api/users/password_reset(.:format)  api/users/password_resets#update
```

- [ ] **Step 4: コミット**

```bash
git add backend/app/controllers/api/users/password_resets_controller.rb backend/config/routes.rb
git commit -m "feat: パスワードリセットAPIエンドポイント追加"
```

---

## Task 5: Frontend — パスワードバリデーション共通ユーティリティ抽出

**Files:**
- Create: `frontend/src/lib/validators.ts`
- Modify: `frontend/src/app/(private)/settings/security/change-password/page.tsx:95-122`

- [ ] **Step 1: 共通バリデーション関数を作成**

`frontend/src/lib/validators.ts`:

```typescript
/**
 * パスワードバリデーション
 * 8文字以上、大文字・小文字・数字を各1文字以上含む
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return "パスワードを入力してください";
  }
  if (password.length < 8) {
    return "8文字以上のパスワードを入力してください";
  }
  if (!/[A-Z]/.test(password)) {
    return "パスワードには大文字を含めてください";
  }
  if (!/[a-z]/.test(password)) {
    return "パスワードには小文字を含めてください";
  }
  if (!/[0-9]/.test(password)) {
    return "パスワードには数字を含めてください";
  }
  return null;
}

/**
 * パスワード確認バリデーション
 */
export function validatePasswordConfirmation(
  password: string,
  confirmation: string
): string | null {
  if (!confirmation) {
    return "パスワード（確認）を入力してください";
  }
  if (password !== confirmation) {
    return "パスワードが一致しません";
  }
  return null;
}
```

- [ ] **Step 2: change-password ページを共通ユーティリティ利用に切り替え**

`frontend/src/app/(private)/settings/security/change-password/page.tsx` の `validateForm` 関数（95-123行目）を置き換え。

インポートを追加（ファイル先頭、既存importの後に）:

```typescript
import { validatePassword } from "@/lib/validators";
```

`validateForm` 関数を以下に置き換え:

```typescript
    const validateForm = (values: ChangePasswordFormValues) => {
        const error: FormErrors = {};

        if (!values.current_password) {
            error.current_password = "現在のパスワードを入力してください";
        }

        const passwordError = validatePassword(values.new_password);
        if (passwordError) {
            error.new_password = passwordError;
        }

        if (!values.confirm_new_password) {
            error.confirm_new_password =
                "新しいパスワード（確認）を入力してください";
        } else if (values.new_password !== values.confirm_new_password) {
            error.confirm_new_password =
                "新しいパスワードと確認用パスワードが一致しません";
        }

        return error;
    };
```

- [ ] **Step 3: 動作確認**

Run: `cd frontend && npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add frontend/src/lib/validators.ts frontend/src/app/\(private\)/settings/security/change-password/page.tsx
git commit -m "refactor: パスワードバリデーションを共通ユーティリティに抽出"
```

---

## Task 6: Frontend — BFFプロキシルート追加

**Files:**
- Create: `frontend/src/app/api/users/password_reset/route.ts`

- [ ] **Step 1: BFFプロキシルートを作成**

`frontend/src/app/api/users/password_reset/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/relay-cookies";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/users/password_reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/users/password_reset`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    const response = NextResponse.json(data, { status: backendRes.status });

    // リセット成功時、レスポンスボディのtokenからCookieを設定
    // （Node.js fetchではSet-Cookieヘッダーを取得できないため）
    if (backendRes.ok && data.token) {
      setAuthCookie(data.token, response);
    }

    return response;
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: コミット**

```bash
git add frontend/src/app/api/users/password_reset/route.ts
git commit -m "feat: パスワードリセット用BFFプロキシルート追加"
```

---

## Task 7: Frontend — ミドルウェア更新とログインページ変更

**Files:**
- Modify: `frontend/src/middleware.ts:4`
- Modify: `frontend/src/app/(auth)/login/page.tsx`

- [ ] **Step 1: ミドルウェアにパブリックパスを追加**

`frontend/src/middleware.ts` の4行目を変更:

```typescript
// Before:
const publicPaths = ["/", "/login", "/register", "/posts"];

// After:
const publicPaths = ["/", "/login", "/register", "/posts", "/forgot-password", "/reset-password"];
```

- [ ] **Step 2: ログインページに「パスワードをお忘れですか？」リンクを追加**

`frontend/src/app/(auth)/login/page.tsx` を以下に変更:

```tsx
import AuthForm from "@/components/features/auth/AuthForm";
import Link from "next/link";

const Login = () => {
    return (
        <div className="flex flex-col items-center gap-4">
            <AuthForm isRegister={false} />
            <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
            >
                パスワードをお忘れですか？
            </Link>
        </div>
    )
}

export default Login;
```

- [ ] **Step 3: 型チェック確認**

Run: `cd frontend && npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add frontend/src/middleware.ts frontend/src/app/\(auth\)/login/page.tsx
git commit -m "feat: ミドルウェアにパスワードリセットパス追加、ログインページにリンク追加"
```

---

## Task 8: Frontend — forgot-password ページ

**Files:**
- Create: `frontend/src/app/(auth)/forgot-password/page.tsx`

- [ ] **Step 1: forgot-passwordページを作成**

`frontend/src/app/(auth)/forgot-password/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRegex =
    /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("正しいメールアドレスを入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users/password_reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password_reset: { email } }),
      });

      if (res.status === 429) {
        setError(
          "リクエストが多すぎます。しばらく時間をおいてから再度お試しください。"
        );
        return;
      }

      // 成功（アカウント列挙防止のため、常に送信完了画面を表示）
      setIsSubmitted(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-card/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-border/50 w-full max-w-md">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center">
            <Mail className="text-sky-600" size={24} />
          </div>
          <h1 className="font-bold text-xl text-foreground">
            メールを送信しました
          </h1>
          <p className="text-sm text-muted-foreground">
            入力されたメールアドレス宛にパスワードリセットのリンクを送信しました。メールに記載されたリンクからパスワードを再設定してください。
          </p>
          <p className="text-xs text-muted-foreground">
            メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </p>
          <Link
            href="/login"
            className="block text-sm text-primary hover:underline mt-4"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-border/50 w-full max-w-md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-center font-bold text-xl text-foreground">
          パスワードをリセット
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
        </p>
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="font-medium text-sm text-foreground mb-1"
          >
            メールアドレス
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail size={18} />
            </div>
            <input
              type="email"
              id="email"
              placeholder="メールアドレスを入力してください"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-input rounded-lg p-2 pl-10 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          {error && <p className="text-destructive text-sm mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "送信中..." : "リセットリンクを送信"}
        </button>
        <div className="flex justify-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
```

- [ ] **Step 2: 型チェック確認**

Run: `cd frontend && npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add frontend/src/app/\(auth\)/forgot-password/page.tsx
git commit -m "feat: パスワードリセット要求ページ追加"
```

---

## Task 9: Frontend — reset-password ページ

**Files:**
- Create: `frontend/src/app/(auth)/reset-password/page.tsx`

- [ ] **Step 1: reset-passwordページを作成**

`frontend/src/app/(auth)/reset-password/page.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { validatePassword, validatePasswordConfirmation } from "@/lib/validators";

type FormErrors = {
  password?: string;
  password_confirmation?: string;
  general?: string;
};

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  // useRefでトークンを保持（replaceStateでURLから除去した後も使えるように）
  const tokenRef = useRef(searchParams.get("token"));

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // URLからトークンを除去（セキュリティ対策）
  useEffect(() => {
    if (tokenRef.current) {
      window.history.replaceState({}, "", "/reset-password");
    }
  }, []);

  if (!tokenRef.current) {
    return (
      <div className="bg-card/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-border/50 w-full max-w-md">
        <div className="text-center space-y-4">
          <h1 className="font-bold text-xl text-foreground">
            無効なリンクです
          </h1>
          <p className="text-sm text-muted-foreground">
            パスワードリセットのリンクが無効です。もう一度リセットを要求してください。
          </p>
          <Link
            href="/forgot-password"
            className="block text-sm text-primary hover:underline"
          >
            パスワードリセットを再要求
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    const confirmError = validatePasswordConfirmation(
      password,
      passwordConfirmation
    );
    if (confirmError) {
      newErrors.password_confirmation = confirmError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users/password_reset", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          password_reset: {
            reset_password_token: tokenRef.current,
            password,
            password_confirmation: passwordConfirmation,
          },
        }),
      });

      if (res.ok) {
        // 自動ログイン成功、ホームに遷移
        window.location.href = "/posts";
      } else {
        const data = await res.json();
        setErrors({
          general:
            data.errors?.[0] || "トークンが無効または期限切れです。もう一度リセットを要求してください。",
        });
      }
    } catch {
      setErrors({ general: "通信エラーが発生しました" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-border/50 w-full max-w-md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-center font-bold text-xl text-foreground">
          新しいパスワードを設定
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          新しいパスワードを入力してください。
        </p>

        {/* 新しいパスワード */}
        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="font-medium text-sm text-foreground mb-1"
          >
            新しいパスワード
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <KeyRound size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="新しいパスワードを入力してください"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-input rounded-lg p-2 pl-10 pr-10 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* パスワード確認 */}
        <div className="flex flex-col">
          <label
            htmlFor="password_confirmation"
            className="font-medium text-sm text-foreground mb-1"
          >
            パスワード確認
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <KeyRound size={18} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="password_confirmation"
              placeholder="パスワードを再度入力してください"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="border border-input rounded-lg p-2 pl-10 pr-10 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-destructive text-sm mt-1">
              {errors.password_confirmation}
            </p>
          )}
        </div>

        {/* 一般エラー */}
        {errors.general && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
            {errors.general}
            <Link
              href="/forgot-password"
              className="block mt-2 text-primary hover:underline"
            >
              もう一度リセットを要求する
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "設定中..." : "パスワードを設定"}
        </button>
      </form>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;
```

**注意**: `useSearchParams()` は Suspense boundary 内で使う必要がある（Next.js 15 の要件）。`ResetPasswordForm` を `Suspense` でラップする。

- [ ] **Step 2: 型チェック確認**

Run: `cd frontend && npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add frontend/src/app/\(auth\)/reset-password/page.tsx
git commit -m "feat: パスワードリセット実行ページ追加"
```

---

## Task 10: 統合テスト（手動確認）

- [ ] **Step 1: 環境変数を設定**

`.env` に以下を追加（開発環境用）:
```
RESEND_API_KEY=re_xxxxxxxxxx
FRONTEND_URL=http://localhost:3000
MAILER_FROM_ADDRESS=noreply@your-domain.com
```

- [ ] **Step 2: Docker環境を再起動**

Run: `docker compose down && docker compose up --build`
Expected: backend, frontend が正常に起動

- [ ] **Step 3: リセット要求フローの確認**

1. http://localhost:3000/login にアクセス
2. 「パスワードをお忘れですか？」リンクが表示されることを確認
3. リンクをクリックして /forgot-password に遷移
4. メールアドレスを入力して送信
5. 「メールを送信しました」画面が表示されることを確認
6. メールが届くことを確認（Resend ダッシュボードでも確認可能）

- [ ] **Step 4: リセット実行フローの確認**

1. メールのリンクをクリックして /reset-password に遷移
2. URLからトークンが除去されることを確認（アドレスバー）
3. 新パスワードを入力（バリデーションルール確認）
4. 送信後、自動ログインしてホームに遷移することを確認

- [ ] **Step 5: エッジケースの確認**

- 存在しないメールアドレス → 同じ「メール送信しました」画面（列挙防止）
- 無効なトークンでリセット → エラー表示
- OAuthユーザーのメールアドレス → Google案内メールが届く
- レートリミット → 6回目のリクエストで429が返る

- [ ] **Step 6: 最終コミット（必要に応じて修正後）**

```bash
git add -A
git commit -m "feat: パスワードリセット機能の統合テスト・調整"
```
