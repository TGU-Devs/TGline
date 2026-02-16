# お問い合わせ機能 設計書（v1.0）

## 概要

ユーザーがアプリ内からバグ報告・機能要望・質問などのフィードバックを送信できる機能です。  
v0では管理画面は実装せず、Rails コンソールで運用します。将来的に管理画面を追加する際に拡張しやすい設計を採用します。

---

## 目的

- ユーザーが簡単にフィードバックを送信できる導線を提供
- フィードバックを DB に蓄積し、将来の管理画面開発に備える
- 管理画面なしでも最低限の運用ができる手段を確保

---

## 設計方針

### 1. 段階的実装

- **v0（現在）**: ユーザーのフィードバック送信機能のみ実装
- **将来**: 管理者用の一覧・詳細表示・ステータス管理機能を追加

### 2. 将来の管理画面を見据えたDB設計

- `status` (pending/reviewed/resolved/closed) を最初から持つ
- `admin_notes`, `reviewed_at`, `reviewed_by` などの管理者用カラムを用意
- これにより、管理画面追加時にマイグレーションが不要

### 3. 外部連携の余地

- データは DB をマスターとして保存
- 将来的に Google Sheets へのエクスポートや連携も可能

---

## データベース設計

### Feedback モデル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | bigint | PK | 主キー |
| `user_id` | bigint | NOT NULL, FK | 送信したユーザーのID |
| `category` | string | NOT NULL | フィードバックの種類 |
| `subject` | string | NOT NULL | 件名（最大100文字） |
| `body` | text | NOT NULL | 本文（10〜2000文字） |
| `status` | string | NOT NULL, default: 'pending' | 対応状況 |
| `admin_notes` | text | nullable | 管理者用メモ（将来用） |
| `reviewed_at` | datetime | nullable | 確認日時（将来用） |
| `reviewed_by` | bigint | nullable | 確認した管理者のID（将来用） |
| `deleted_at` | datetime | nullable | 論理削除（既存パターンに合わせる） |
| `created_at` | datetime | NOT NULL | 作成日時 |
| `updated_at` | datetime | NOT NULL | 更新日時 |

### Enum 定義

**category（フィードバック種別）**
- `bug`: バグ報告
- `feature_request`: 機能要望
- `question`: 質問
- `other`: その他

**status（対応状況）**
- `pending`: 未対応
- `reviewed`: 確認済み
- `resolved`: 対応完了
- `closed`: クローズ

### インデックス

```ruby
add_index :feedbacks, :status
add_index :feedbacks, :category
add_index :feedbacks, :created_at
add_index :feedbacks, :user_id
```

### マイグレーション

```ruby
# db/migrate/YYYYMMDDHHMMSS_create_feedbacks.rb
class CreateFeedbacks < ActiveRecord::Migration[7.2]
  def change
    create_table :feedbacks do |t|
      t.references :user, null: false, foreign_key: true
      t.string     :category,    null: false
      t.string     :subject,     null: false
      t.text       :body,        null: false
      t.string     :status,      null: false, default: "pending"
      t.text       :admin_notes
      t.datetime   :reviewed_at
      t.bigint     :reviewed_by
      t.datetime   :deleted_at
      t.timestamps
    end

    add_index :feedbacks, :status
    add_index :feedbacks, :category
    add_index :feedbacks, :created_at
  end
end
```

---

## バックエンド実装（Rails）

### モデル

```ruby
# app/models/feedback.rb
class Feedback < ApplicationRecord
  belongs_to :user
  belongs_to :reviewer, class_name: "User", foreign_key: "reviewed_by", optional: true

  validates :category, presence: true, inclusion: { in: %w[bug feature_request question other] }
  validates :subject, presence: true, length: { maximum: 100 }
  validates :body, presence: true, length: { minimum: 10, maximum: 2000 }
  validates :status, presence: true, inclusion: { in: %w[pending reviewed resolved closed] }

  scope :active, -> { where(deleted_at: nil) }
  scope :pending, -> { where(status: "pending") }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_status, ->(status) { where(status: status) }

  def soft_delete
    update(deleted_at: Time.current)
  end

  def deleted?
    deleted_at.present?
  end
end
```

### コントローラー

```ruby
# app/controllers/api/feedbacks_controller.rb
class Api::FeedbacksController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!, only: [:index, :show, :update]

  # POST /api/feedbacks
  # ユーザーがフィードバックを送信
  def create
    feedback = current_user.feedbacks.build(feedback_params)
    
    if feedback.save
      render json: {
        message: "フィードバックを送信しました",
        feedback: feedback_response(feedback)
      }, status: :created
    else
      render json: { errors: feedback.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # === 以下は将来の管理画面用（v0では未使用）===

  # GET /api/feedbacks
  # 管理者がフィードバック一覧を取得
  # def index
  #   feedbacks = Feedback.active.order(created_at: :desc)
  #   feedbacks = feedbacks.by_status(params[:status]) if params[:status].present?
  #   feedbacks = feedbacks.by_category(params[:category]) if params[:category].present?
  #   
  #   render json: {
  #     feedbacks: feedbacks.map { |f| feedback_response(f) },
  #     total: feedbacks.count
  #   }
  # end

  # GET /api/feedbacks/:id
  # 管理者がフィードバック詳細を取得
  # def show
  #   feedback = Feedback.active.find(params[:id])
  #   render json: feedback_response(feedback, detail: true)
  # end

  # PATCH /api/feedbacks/:id
  # 管理者がステータス更新・メモ追加
  # def update
  #   feedback = Feedback.active.find(params[:id])
  #   feedback.assign_attributes(admin_update_params)
  #   feedback.reviewed_at = Time.current
  #   feedback.reviewed_by = current_user.id
  #   
  #   if feedback.save
  #     render json: {
  #       message: "フィードバックを更新しました",
  #       feedback: feedback_response(feedback, detail: true)
  #     }
  #   else
  #     render json: { errors: feedback.errors.full_messages }, status: :unprocessable_entity
  #   end
  # end

  private

  def feedback_params
    params.require(:feedback).permit(:category, :subject, :body)
  end

  # def admin_update_params
  #   params.require(:feedback).permit(:status, :admin_notes)
  # end

  def feedback_response(feedback, detail: false)
    response = {
      id: feedback.id,
      category: feedback.category,
      subject: feedback.subject,
      status: feedback.status,
      created_at: feedback.created_at
    }

    if detail
      response.merge!(
        body: feedback.body,
        admin_notes: feedback.admin_notes,
        reviewed_at: feedback.reviewed_at,
        user: {
          id: feedback.user.id,
          display_name: feedback.user.display_name,
          email: feedback.user.email
        }
      )
    end

    response
  end
end
```

### ルーティング

```ruby
# config/routes.rb
namespace :api do
  # ... 既存のルート ...
  
  # v0: create のみ
  resources :feedbacks, only: [:create]
  
  # 将来の管理画面用（コメントアウト）
  # resources :feedbacks, only: [:index, :show, :create, :update]
end
```

---

## フロントエンド実装

### 1. 設定画面にお問い合わせセクションを追加

**場所**: `frontend/src/app/(private)/settings/page.tsx`

**配置位置**: `SecuritySection` の下、`Footer` の上

```tsx
import { MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

// ... 既存のコード ...

<SecuritySection icon={Shield} securityOptions={SECURITY_OPTIONS} />

{/* お問い合わせセクション */}
<section className="rounded-3xl border bg-white border-slate-100 shadow-sm mb-6">
  <div className="p-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
        <MessageCircleQuestion size={20} />
      </div>
      <div>
        <h3 className="font-bold text-lg text-slate-800">お問い合わせ</h3>
        <p className="text-sm text-slate-400">
          バグ報告・機能要望・ご質問など
        </p>
      </div>
    </div>
    <Link
      href="/feedback"
      className="px-5 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all text-sm font-medium"
    >
      お問い合わせフォームへ
    </Link>
  </div>
</section>

<Footer />
```

### 2. フィードバックフォームページ

**場所**: `frontend/src/app/(private)/feedback/page.tsx`

**機能**:
- カテゴリー選択（バグ報告・機能要望・質問・その他）
- 件名入力（テキスト、最大100文字）
- 本文入力（テキストエリア、10〜2000文字）
- バリデーション
- 送信成功時のトースト表示
- 送信後に設定画面に戻る

**実装パターン**: 既存の `posts/new/page.tsx` と同様の構造

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageCircleQuestion } from "lucide-react";

const CATEGORIES = [
  { value: "bug", label: "バグ報告" },
  { value: "feature_request", label: "機能要望" },
  { value: "question", label: "質問" },
  { value: "other", label: "その他" },
];

export default function FeedbackPage() {
  const router = useRouter();
  const [category, setCategory] = useState("question");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!subject.trim() || !body.trim()) {
      setError("件名と本文を入力してください");
      return;
    }

    if (body.length < 10) {
      setError("本文は10文字以上入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ feedback: { category, subject, body } }),
      });

      if (res.ok) {
        router.push("/settings?feedback=success");
      } else {
        const data = await res.json();
        setError(data.errors?.join(", ") || "送信に失敗しました");
      }
    } catch (err) {
      setError("送信中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-sky-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-sky-500 text-white">
            <MessageCircleQuestion size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">お問い合わせ</h1>
            <p className="text-slate-500 text-sm mt-1">
              バグ報告・機能要望・ご質問などをお送りください
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          {/* カテゴリー選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              カテゴリー
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 件名 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              件名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              placeholder="件名を入力してください"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-1">
              {subject.length}/100文字
            </p>
          </div>

          {/* 本文 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              本文 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
              rows={8}
              placeholder="詳細を入力してください（10文字以上）"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              {body.length}/2000文字（最低10文字）
            </p>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {isSubmitting ? "送信中..." : "送信する"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
```

### 3. Next.js APIルート（プロキシ）

**場所**: `frontend/src/app/api/feedbacks/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookie = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${BACKEND_URL}/api/feedbacks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      { errors: ["送信に失敗しました"] },
      { status: 500 }
    );
  }
}

// 将来の管理画面用
// export async function GET(request: NextRequest) {
//   const cookie = request.headers.get("cookie") || "";
//   const { searchParams } = new URL(request.url);
//   const status = searchParams.get("status");
//   const category = searchParams.get("category");
//
//   const queryString = new URLSearchParams();
//   if (status) queryString.append("status", status);
//   if (category) queryString.append("category", category);
//
//   const backendRes = await fetch(
//     `${BACKEND_URL}/api/feedbacks?${queryString}`,
//     {
//       method: "GET",
//       headers: { Cookie: cookie },
//     }
//   );
//
//   const data = await backendRes.json();
//   return NextResponse.json(data, { status: backendRes.status });
// }
```

---

## 運用方法（管理画面なし時）

管理画面がない期間は、Rails コンソールでフィードバックを確認・管理します。

### 1. コンソールへの接続

```bash
docker compose exec backend bundle exec rails console
```

### 2. フィードバックの一覧確認

```ruby
# 全フィードバック（最新20件）
Feedback.active.order(created_at: :desc).limit(20)

# 未対応のみ
Feedback.pending.order(created_at: :desc)

# カテゴリー別（バグ報告のみ）
Feedback.by_category("bug").order(created_at: :desc)

# ステータス別
Feedback.by_status("pending").order(created_at: :desc)
```

### 3. 詳細の確認

```ruby
# ID指定で取得
feedback = Feedback.find(1)

# 全情報を表示
feedback.attributes

# 送信者情報
feedback.user.display_name
feedback.user.email

# 内容表示
puts "件名: #{feedback.subject}"
puts "カテゴリー: #{feedback.category}"
puts "本文:\n#{feedback.body}"
puts "送信日時: #{feedback.created_at}"
```

### 4. ステータスの更新

```ruby
# 確認済みにする
feedback = Feedback.find(1)
feedback.update(
  status: "reviewed",
  admin_notes: "確認しました。次回アップデートで対応予定。",
  reviewed_at: Time.current,
  reviewed_by: User.find_by(role: "admin").id
)

# 対応完了にする
feedback.update(status: "resolved", admin_notes: "v1.2で修正しました")

# クローズする
feedback.update(status: "closed", admin_notes: "重複のためクローズ")
```

### 5. 統計情報の確認

```ruby
# 総数
Feedback.active.count

# ステータス別の集計
Feedback.active.group(:status).count

# カテゴリー別の集計
Feedback.active.group(:category).count

# 今月の件数
Feedback.where("created_at >= ?", Time.current.beginning_of_month).count
```

### 6. CSV エクスポート（必要な場合）

```ruby
require 'csv'

CSV.open("feedbacks_#{Date.today}.csv", "w") do |csv|
  csv << ["ID", "カテゴリー", "件名", "本文", "ステータス", "送信者", "送信日時"]
  
  Feedback.active.order(created_at: :desc).each do |f|
    csv << [
      f.id,
      f.category,
      f.subject,
      f.body,
      f.status,
      f.user.display_name,
      f.created_at.strftime("%Y-%m-%d %H:%M")
    ]
  end
end
```

---

## API仕様

### POST /api/feedbacks

フィードバックを送信する。

**認証**: 必須（ログインユーザーのみ）

**リクエストボディ**:
```json
{
  "feedback": {
    "category": "bug",
    "subject": "投稿の編集ができない",
    "body": "投稿の編集ボタンを押してもページが表示されません。エラーメッセージも出ません。"
  }
}
```

**レスポンス（成功: 201 Created）**:
```json
{
  "message": "フィードバックを送信しました",
  "feedback": {
    "id": 1,
    "category": "bug",
    "subject": "投稿の編集ができない",
    "status": "pending",
    "created_at": "2026-02-16T10:30:00Z"
  }
}
```

**レスポンス（失敗: 422 Unprocessable Entity）**:
```json
{
  "errors": [
    "Subject can't be blank",
    "Body is too short (minimum is 10 characters)"
  ]
}
```

### 将来の管理画面用 API（v0では未実装）

#### GET /api/feedbacks

フィードバック一覧を取得（管理者のみ）。

**クエリパラメータ**:
- `status`: ステータスでフィルタ（pending/reviewed/resolved/closed）
- `category`: カテゴリーでフィルタ（bug/feature_request/question/other）

#### GET /api/feedbacks/:id

フィードバック詳細を取得（管理者のみ）。

#### PATCH /api/feedbacks/:id

フィードバックのステータス・メモを更新（管理者のみ）。

---

## 将来の拡張

### 1. 管理画面の追加

**必要な作業**:
1. フロントエンドに管理者用ページを追加（`/admin/feedbacks` など）
2. バックエンドのコントローラーで、コメントアウトしたアクション（`index`, `show`, `update`）を有効化
3. Next.js の API ルートに `GET` / `PATCH` を追加

**必要ないこと**:
- DB マイグレーション（すでに必要なカラムは存在）
- モデルの変更（バリデーション・スコープは実装済み）
- 新しいエンドポイントの設計（コメントアウトのコードを使用）

### 2. Google Sheets への連携

**パターンA: 定期エクスポート**
- Rake タスクで定期的に CSV 生成 → Google Sheets API で書き込み
- データの主役は DB のまま、Sheets は「閲覧用」

**パターンB: リアルタイム連携**
- `after_create` コールバックで Sheets API に書き込み
- デメリット: 外部 API への依存、送信の遅延

### 3. メール通知

フィードバックが送信されたら管理者にメール通知。

```ruby
# app/mailers/feedback_mailer.rb
class FeedbackMailer < ApplicationMailer
  def new_feedback(feedback)
    @feedback = feedback
    mail(to: "admin@example.com", subject: "新しいフィードバック: #{feedback.subject}")
  end
end

# app/models/feedback.rb に追加
after_create :notify_admin

def notify_admin
  FeedbackMailer.new_feedback(self).deliver_later
end
```

---

## 設計の利点

### 1. 最小限の初期実装

- v0 では送信機能のみ実装するため、工数が少ない
- Rails コンソールで運用できるため、管理画面開発を先延ばしできる

### 2. 将来への拡張性

- DB に必要なカラムがすべて揃っているため、管理画面追加時にマイグレーション不要
- API エンドポイントのスケルトンがコメントで残っているため、実装の指針が明確

### 3. データの一貫性

- DB をマスターとすることで、外部連携を後から追加しても矛盾が起きない
- ユーザー情報との紐づけが確実

### 4. 段階的な運用スケール

- 初期: コンソール運用
- 中期: CSV エクスポート → Sheets 閲覧
- 長期: 専用管理画面

---

## まとめ

この設計により、以下を実現できます。

- ✅ ユーザーが簡単にフィードバックを送信できる
- ✅ 管理画面なしでも Rails コンソールで確認・管理可能
- ✅ 将来の管理画面追加時に最小限の追加実装で対応可能
- ✅ 外部連携（Sheets など）も後から追加可能
- ✅ 既存のコードベース（Post/User）のパターンに準拠

まずは v0 として送信機能のみを実装し、運用しながら必要に応じて管理機能を拡張していく、という段階的なアプローチが可能です。


## 今後の実装予定
・送信完了後のポップを表示
・送信後管理者がフィードバックをターミナルで確認できる