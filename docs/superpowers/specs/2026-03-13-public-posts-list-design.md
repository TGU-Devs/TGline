# 投稿一覧ページの公開化 設計書

## ゴール

未ログインユーザーでも投稿一覧ページ (`/posts`) を閲覧できるようにし、アプリの雰囲気を事前に確認させることでユーザーの不安感を取り除く。ログインが必要なアクション（いいね、詳細閲覧、新規投稿）にはモーダルでログインを促す。

## 背景

現状、トップページ（ランディング）以外は全て認証必須。ユーザーは登録前にアプリの中身を見れないため、「どんなアプリかわからない」という不安がある。投稿一覧を公開することでこの障壁を下げる。

---

## 変更概要

### 1. バックエンド

**PostsController (`app/controllers/api/posts_controller.rb`)**
- `index` アクションに `skip_before_action :authenticate_user!` を追加
- 他のアクション（show, create, update, destroy）は認証必須のまま
- 未認証リクエスト時、`current_user` は `nil` になるため `current_user_liked` は常に `false` を返す（`current_user&.id` による安全なnil処理で対応済み）

### 2. フロントエンド — ミドルウェア (`src/middleware.ts`)

- `publicPaths` に `"/posts"` を追加
- ログイン済み + public パスのリダイレクト条件に `/posts` の除外を追加:
  ```typescript
  // 変更前
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/posts", request.url));
  }
  // 変更後
  if (token && isPublicPath && pathname !== "/posts") {
    return NextResponse.redirect(new URL("/posts", request.url));
  }
  ```
  理由: `/posts` は公開ページだがログイン済みユーザーも利用する。除外しないと無限リダイレクトが発生する。

### 3. フロントエンド — ルーティング & レイアウト

**ページ移動:**
- `app/(private)/posts/page.tsx` → `app/(public)/posts/page.tsx` に移動

**レイアウト (`app/(public)/layout.tsx`) — 新規作成:**
- 認証状態に応じてレイアウトを出し分け:

| デバイス | 未ログイン | ログイン済み |
|---------|-----------|------------|
| PC | Navigation ヘッダー（ロゴのみ）+ コンテンツ | DesktopSidebar + コンテンツ（現行と同じ） |
| スマホ | MobileNav ヘッダーのみ（ハンバーガー非表示）+ コンテンツ | MobileNav（現行と同じ） |

**認証状態の取得:**
- `/api/users/me` を呼んでユーザー情報を取得（未ログインなら null）
- `UserProvider` はログイン済みの場合のみラップ

**既存ランディングページ (`app/(public)/page.tsx`) への影響:**
- 現在ランディングページは独自にレイアウトをインラインで組んでいる。新設する `(public)/layout.tsx` は最小限（認証チェック + 出し分けロジック）にし、ランディングページの既存レイアウトを壊さないようにする。ランディングページは自前の Navigation を持つため、layout からの Navigation は `/posts` 配下でのみ適用する。

### 4. フロントエンド — 投稿一覧ページの修正 (`posts/page.tsx`)

未ログイン時の挙動変更:

| アクション | 未ログイン | ログイン済み |
|-----------|-----------|------------|
| 新規投稿ボタン | クリック → LoginPromptModal | `/posts/new` に遷移 |
| いいねボタン | クリック → LoginPromptModal | 通常のいいね処理 |
| 投稿カード（詳細遷移） | クリック → LoginPromptModal | `/posts/:id` に遷移 |
| 空状態の「投稿を作成」ボタン | クリック → LoginPromptModal | `/posts/new` に遷移 |
| タグフィルター | 通常動作（閲覧の範囲） | 通常動作 |

**投稿カードのクリック制御:**
- 未ログイン時: `<Link>` の代わりに `<div onClick>` でモーダルを表示（`<Link>` のままだとナビゲーションを止められないため）
- ログイン済み時: 通常の `<Link>` で `/posts/:id` に遷移

**トークン期限切れへの対応:**
- いいね等のAPIが 401 を返した場合、LoginPromptModal を表示する（未ログイン状態と同じ扱い）

### 5. フロントエンド — LoginPromptModal（新規コンポーネント）

**ファイル:** `src/components/features/auth/LoginPromptModal.tsx`

**仕様:**
- 既存の Radix UI `Dialog` コンポーネントをベースに構築
- Props: `isOpen`, `onClose`
- 表示内容:
  - メッセージ: 「この機能を使うにはログインが必要です」
  - 「ログイン」ボタン → `/login` に遷移
  - 「新規登録」ボタン → `/register` に遷移
  - 閉じるボタン（×）
- バックドロップクリックで閉じる

---

## 依存関係の確認

- **Tags API (`/api/tags`):** TagsController は既に `skip_before_action :authenticate_user!, only: [:index]` が設定されているため、未ログインでもタグフィルターは動作する。追加変更不要。
- **Posts API Route Handler (`frontend/src/app/api/posts/route.ts`):** Cookie ヘッダーをバックエンドに転送する。Cookie がない場合は空文字列が送られるが、バックエンドの `posts#index` は認証スキップのため問題なし。

---

## 影響範囲

### 変更するファイル

| ファイル | 変更内容 |
|---------|---------|
| `backend/app/controllers/api/posts_controller.rb` | `index` の認証スキップ追加 |
| `frontend/src/middleware.ts` | `publicPaths` に `/posts` 追加、リダイレクトロジック修正 |
| `frontend/src/app/(private)/posts/page.tsx` | `(public)` に移動 + 未ログイン時の挙動追加 |
| `frontend/src/components/layout/sidebar/MobileNav.tsx` | 未ログイン時のハンバーガー非表示対応 |

### 新規作成するファイル

| ファイル | 内容 |
|---------|------|
| `frontend/src/app/(public)/layout.tsx` | 認証状態に応じたレイアウト出し分け |
| `frontend/src/components/features/auth/LoginPromptModal.tsx` | ログイン促進モーダル |

### 影響しないもの

- 投稿詳細ページ (`/posts/:id`) — 認証必須のまま
- 投稿作成/編集/削除 — 認証必須のまま
- 他の private ページ — 変更なし
- バックエンドの他のエンドポイント — 変更なし
- ランディングページ — 既存レイアウトを維持

---

## セキュリティ考慮

- バックエンドの `posts#index` のみ公開。投稿の作成・更新・削除・詳細は認証必須のまま
- フロントエンドのモーダルはUXの補助であり、セキュリティの境界はバックエンドの認証チェックが担保する
