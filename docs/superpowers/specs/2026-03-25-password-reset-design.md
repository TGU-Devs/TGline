# パスワードリセット機能 設計書

**作成日**: 2026-03-25
**ブランチ**: feat/password-reset

---

## 概要

ユーザーがパスワードを忘れた際に、メールを通じてパスワードをリセットできる機能を実装する。Deviseの `:recoverable` モジュールを活用し、メール送信にはResendを使用する。

## 要件

- メールにリセット用リンクを送信するフロー
- OAuthユーザーにはGoogleログイン案内メールを送る
- リセット成功後は自動ログイン（JWT発行）してホームに遷移
- アカウント列挙攻撃を防ぐため、常に同一レスポンスを返す
- パスワードリセットエンドポイントにレートリミットを導入

---

## 全体フロー

```
ユーザー（ブラウザ）
  ↓ 1. メールアドレス入力（/forgot-password）
  ↓ POST /api/users/password_reset
Next.js BFF
  ↓ POST /api/users/password_reset（プロキシ）
Rails API
  ↓ 2. Devise recoverable でトークン生成
  ↓ 3. OAuthユーザーか判定 → 分岐
  ↓ 4. Resend でメール送信（リセットリンク or Google案内）
  ↓ 5. 常に { message: "メールを送信しました" } を返す

ユーザー（メール）
  ↓ 6. リンクをクリック → /reset-password?token=xxx
  ↓ 7. 新パスワード入力
  ↓ PATCH /api/users/password_reset
Next.js BFF
  ↓ PATCH /api/users/password_reset（プロキシ）
Rails API
  ↓ 8. Devise でトークン検証 + パスワード更新
  ↓ 9. JWTトークン発行 → Cookie設定（自動ログイン）
  ↓ 10. フロントエンドでホームに遷移
```

---

## APIエンドポイント

### Backend（Rails）

#### 1. リセット要求: `POST /api/users/password_reset`

```
Request:  { email: "user@example.com" }
Response: { message: "メールを送信しました" }  ← 常に200（列挙防止）
```

- `User.active.find_by(email:)` でユーザー検索（論理削除済みユーザーを除外）
- 未登録 or 論理削除済み → 何もせず200を返す
- OAuthユーザー（`provider` が存在）→ Google案内メール送信して200
- 通常ユーザー → トークン生成 + リセットメール送信して200

**注意**: `PasswordResetsController` は `skip_before_action :authenticate_user!` を設定すること（未認証ユーザーが利用するため）。

#### 2. パスワードリセット実行: `PATCH /api/users/password_reset`

```
Request:  { reset_password_token: "xxx", password: "NewPass123", password_confirmation: "NewPass123" }
Response:
  成功 → { user: { id, email, display_name, role } } + JWT Cookie設定
  失敗 → { errors: ["トークンが無効または期限切れです"] } 422
```

- `User.reset_password_by_token` でDeviseのトークン検証 + パスワード更新（Deviseが期待するパラメータ名 `reset_password_token` を使用）
- 成功時にJWT発行してCookieにセット（既存の sessions_controller と同じ方式）

### サーバー側パスワードバリデーション

Userモデルにカスタムバリデーションを追加し、フロントエンドと同じルールをサーバー側でも適用する:
- 最低8文字
- 大文字を1文字以上含む
- 小文字を1文字以上含む
- 数字を1文字以上含む

これにより `reset_password_by_token` 実行時もDeviseの6文字最小ではなく、強化されたポリシーが適用される。

#### ルーティング

```ruby
# config/routes.rb（api/users スコープ内）
post   'password_reset', to: 'password_resets#create'
patch  'password_reset', to: 'password_resets#update'
```

### Frontend BFF（Next.js）

```
POST  /api/users/password_reset  → Rails POST /api/users/password_reset
PATCH /api/users/password_reset  → Rails PATCH /api/users/password_reset
```

既存のBFFプロキシパターンに合わせてCookie中継も行う。

---

## メール送信（Resend）

### セットアップ

- `resend` gem をBackendに追加
- 環境変数: `RESEND_API_KEY`、`FRONTEND_URL`（リンク生成用）
- `config/initializers/resend.rb` で初期化

### メーラー構成

`PasswordResetMailer` を新規作成（Deviseのデフォルトメーラーは使わず、Resend APIを直接利用）。

#### 1. リセットメール（通常ユーザー向け）

- 件名: 「パスワードリセットのご案内」
- 本文: リセットリンク（`{FRONTEND_URL}/reset-password?token=xxx`）+ 有効期限6時間の案内
- From: `noreply@（Resendで認証したドメイン）`

#### 2. Google案内メール（OAuthユーザー向け）

- 件名: 「ログイン方法のご案内」
- 本文: 「このアカウントはGoogleアカウントで登録されています。Googleログインをご利用ください」+ ログインページリンク

### Deviseとの統合

トークン生成とメール送信を分離する:

```ruby
# トークン生成のみDeviseを使う
raw_token, enc_token = Devise.token_generator.generate(User, :reset_password_token)
user.reset_password_token = enc_token
user.reset_password_sent_at = Time.current
user.save!

# メール送信はResendで独自に行う
PasswordResetMailer.reset_email(user, raw_token).deliver_now
```

Deviseのトークン検証（`reset_password_by_token`）はそのまま活用。

---

## フロントエンド

### 新規ページ

#### 1. `/forgot-password`（パスワードリセット要求画面）

- `(auth)` グループに配置
- メールアドレス入力フォーム
- 送信後:「メールを送信しました。メールに記載されたリンクからパスワードを再設定してください」と表示
- ログイン画面へ戻るリンク

#### 2. `/reset-password`（新パスワード設定画面）

- `(auth)` グループに配置
- URLクエリパラメータから `token` を取得
- 新パスワード + 確認入力フォーム
- 既存のパスワードバリデーション（8文字以上、大文字・小文字・数字）を再利用
- 成功時: JWT Cookieが設定され、ホーム（`/`）にリダイレクト
- トークン無効/期限切れ時: エラー表示 + 「もう一度リセットを要求する」リンク

### 既存ページへの変更

- ログイン画面（`/login`）に「パスワードをお忘れですか？」リンクを追加 → `/forgot-password`

### ミドルウェア更新

`middleware.ts` のパブリックパスに `/forgot-password` と `/reset-password` を追加。

### コンポーネント方針

- 各ページに専用フォームを配置（既存の `AuthForm.tsx` は流用しない）
- パスワードバリデーションロジックを共通ユーティリティとして切り出し、change-password と reset-password で共有する

### セキュリティ上の注意

- リセットトークンはURLクエリパラメータで渡されるため、reset-password ページではサードパーティスクリプトを読み込まない
- トークン取得後、`window.history.replaceState` でURLからトークンを除去する
- サーバーアクセスログ内のトークンはセンシティブデータとして扱う

---

## レートリミット

### `rack-attack` gem 導入

#### ルール

1. **IPベースの制限**: `POST /api/users/password_reset` に対して同一IPから5回/1時間

※ メールベースの制限はアカウント列挙攻撃のサイドチャネルになりうるため、IPベースのみとする。

#### レスポンス

制限超過時は `429 Too Many Requests`:
```json
{ "error": "リクエストが多すぎます。しばらく時間をおいてから再度お試しください。" }
```

#### フロントエンド側の対応

BFFプロキシで429レスポンスをそのままクライアントに中継し、エラーメッセージを表示。

#### スコープ

今回はパスワードリセットエンドポイントのみに適用。他のエンドポイントへの拡張は別タスク。

---

## エラーハンドリング

### Resend API障害時

- メール送信失敗時はエラーをログに記録する（`Rails.logger.error`）
- ユーザーへのレスポンスは変えない（常に200）— 攻撃者にインフラ障害情報を与えない
- 将来的に `deliver_later`（Active Job）への移行を検討

### 既知の制限事項

- パスワードリセット後、既存のJWTトークンは無効化されない（現在のJWT基盤にトークン失効機構がないため）。これは将来の改善事項とする。

---

## 既存インフラの活用

| 項目 | 状態 |
|------|------|
| `reset_password_token` カラム | DB に存在済み |
| `reset_password_sent_at` カラム | DB に存在済み |
| Devise `:recoverable` モジュール | 有効済み |
| `reset_password_within = 6.hours` | 設定済み |
| `sign_in_after_reset_password = true` | 設定済み |
| JWT認証基盤 | 実装済み |
| BFFプロキシパターン | 確立済み |

## 新規追加が必要なもの

| 項目 | 詳細 |
|------|------|
| `resend` gem | メール送信 |
| `rack-attack` gem | レートリミット |
| `PasswordResetsController` | リセット要求・実行API |
| `PasswordResetMailer` | Resendによるメール送信 |
| `config/initializers/resend.rb` | Resend初期化 |
| `config/initializers/rack_attack.rb` | レートリミット設定 |
| `/forgot-password` ページ | メールアドレス入力画面 |
| `/reset-password` ページ | 新パスワード設定画面 |
| BFFプロキシルート | `password_reset` のPOST/PATCH |
| 環境変数 | `RESEND_API_KEY`、`FRONTEND_URL` |
