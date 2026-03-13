# 投稿一覧ページ公開化 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 未ログインユーザーが投稿一覧ページを閲覧でき、ログインが必要なアクションにはモーダルで促す。

**Architecture:** バックエンド `posts#index` の認証スキップ → フロントエンド ミドルウェア・ルーティング修正 → 投稿一覧ページに認証状態による条件分岐追加 → ログイン促進モーダル新規作成。

**Tech Stack:** Rails 7 API, Next.js 15 App Router, Radix UI Dialog, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-13-public-posts-list-design.md`

---

## File Structure

### 変更するファイル

| ファイル | 責務 |
|---------|------|
| `backend/app/controllers/api/posts_controller.rb` | `index` の認証スキップ |
| `frontend/src/middleware.ts` | `/posts` を公開パスに追加 |
| `frontend/src/app/(public)/posts/page.tsx` | `(private)` から移動 + 未ログイン対応 |
| `frontend/src/components/layout/sidebar/MobileNav.tsx` | 未ログイン時ハンバーガー非表示 |

### 新規作成するファイル

| ファイル | 責務 |
|---------|------|
| `frontend/src/app/(public)/layout.tsx` | 認証状態に応じたレイアウト出し分け |
| `frontend/src/components/features/auth/LoginPromptModal.tsx` | ログイン促進モーダル |

### 削除するファイル

| ファイル | 理由 |
|---------|------|
| `frontend/src/app/(private)/posts/page.tsx` | `(public)` に移動するため |

---

## Chunk 1: バックエンド + ミドルウェア

### Task 1: バックエンド — posts#index の認証スキップ

**Files:**
- Modify: `backend/app/controllers/api/posts_controller.rb:1-10`

- [ ] **Step 1: `posts_controller.rb` に `skip_before_action` を追加**

```ruby
# frozen_string_literal: true

module Api
  # 投稿管理用コントローラー
  class PostsController < ApplicationController
    skip_before_action :authenticate_user!, only: [:index]
    # postが存在するかどうかを確認するメソッド
    before_action :set_post, only: [:show, :update, :destroy]
```

既存の `before_action :set_post` の上に1行追加するだけ。`index` 以外（show, create, update, destroy）は認証必須のまま。

`current_user` が `nil` の場合、`post_response` 内の `current_user&.id` は `nil` を返すので `current_user_liked` は常に `false` になる。これは意図通り。

- [ ] **Step 2: 動作確認**

Run: `cd backend && bundle exec rails runner "puts Api::PostsController.instance_method(:index).source_location"`
Expected: ファイルパスと行番号が表示される（構文エラーがないことの確認）

- [ ] **Step 3: Commit**

```bash
git add backend/app/controllers/api/posts_controller.rb
git commit -m "feat: allow unauthenticated access to posts#index"
```

---

### Task 2: フロントエンド — ミドルウェア修正

**Files:**
- Modify: `frontend/src/middleware.ts`

- [ ] **Step 1: `publicPaths` に `/posts` を追加し、リダイレクトロジックを修正**

`frontend/src/middleware.ts` を以下の内容に変更:

```typescript
import { NextRequest, NextResponse } from "next/server";

// 認証不要（未ログインユーザー向け）のパス
const publicPaths = ["/", "/login", "/register", "/posts"];

// middleware が適用されないパス
// API routes, _next, static files は除外
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("jwt_token");

  const isPublicPath = publicPaths.includes(pathname);

  // 認証済み + public/auth ページ → /posts にリダイレクト
  // ただし /posts 自体はログイン済みでもアクセスするのでリダイレクトしない
  if (token && isPublicPath && pathname !== "/posts") {
    return NextResponse.redirect(new URL("/posts", request.url));
  }

  // 未認証 + private ページ → /login にリダイレクト
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

変更点:
1. `publicPaths` に `"/posts"` を追加
2. リダイレクト条件に `&& pathname !== "/posts"` を追加（無限リダイレクト防止）

- [ ] **Step 2: Commit**

```bash
git add frontend/src/middleware.ts
git commit -m "feat: add /posts to public paths in middleware"
```

---

## Chunk 2: LoginPromptModal + MobileNav修正

### Task 3: LoginPromptModal コンポーネント作成

**Files:**
- Create: `frontend/src/components/features/auth/LoginPromptModal.tsx`

- [ ] **Step 1: LoginPromptModal を作成**

```typescript
"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

type LoginPromptModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ログインが必要です</DialogTitle>
          <DialogDescription>
            この機能を使うにはログインが必要です。アカウントをお持ちでない方は新規登録してください。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => router.push("/login")}
            className="w-full sm:w-auto"
          >
            <LogIn className="h-4 w-4 mr-2" />
            ログイン
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/register")}
            className="w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            新規登録
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/features/auth/LoginPromptModal.tsx
git commit -m "feat: add LoginPromptModal component"
```

---

### Task 4: MobileNav — 未ログイン時のハンバーガー非表示

**Files:**
- Modify: `frontend/src/components/layout/sidebar/MobileNav.tsx:42-56`

- [ ] **Step 1: MobileNav にハンバーガーボタンの条件分岐を追加**

`MobileNav.tsx` のヘッダー部分を修正。`currentUser` が `null` の場合はハンバーガーボタンを非表示にし、ドロワーも開かないようにする。

既存のヘッダー部分（42-56行目）を以下に変更:

```tsx
    return (
        <div className="lg:hidden">
            <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar px-3 shadow-sm">
                <Logo isDesktop={false} />

                {currentUser && (
                    <button
                        onClick={toggleMenu}
                        className="p-2  rounded-md transition-colors active:scale-90"
                        aria-label="Toggle Menu"
                        aria-controls="mobile-nav-menu"
                        aria-expanded={isMenuOpen}
                    >
                        <Menu size={28} />
                    </button>
                )}
            </header>
```

変更点: ハンバーガーボタンを `{currentUser && (...)}` で囲む。未ログイン時はロゴだけのヘッダーになる。

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/layout/sidebar/MobileNav.tsx
git commit -m "feat: hide hamburger menu for unauthenticated users"
```

---

## Chunk 3: レイアウト + 投稿一覧ページ修正

### Task 5: (public)/layout.tsx — 認証状態によるレイアウト出し分け

**Files:**
- Create: `frontend/src/app/(public)/layout.tsx`

- [ ] **Step 1: (public)/layout.tsx を作成**

既存の `Navigation` コンポーネントは `position: absolute` を使っているため、そのまま使うとコンテンツがヘッダーの裏に隠れる。未認証デスクトップ用には MobileNav と同じスタイルで固定ヘッダーを直接記述する。

```typescript
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserProvider } from "@/contexts/UserContext";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/sidebar/MobileNav";
import Logo from "@/components/layout/sidebar/Logo";

type AuthState = "loading" | "authenticated" | "unauthenticated";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    // ランディングページでは認証チェック不要
    if (pathname === "/") {
      setAuthState("unauthenticated");
      return;
    }
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => {
        setAuthState(res.ok ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        setAuthState("unauthenticated");
      });
  }, [pathname]);

  // ランディングページ（/）は独自レイアウトを持つのでそのまま表示
  if (pathname === "/") {
    return <>{children}</>;
  }

  // ローディング中
  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証済み: Sidebar 付きレイアウト（private layout と同じ見た目）
  if (authState === "authenticated") {
    return (
      <UserProvider>
        <div className="lg:flex">
          <Sidebar />
          <main className="pt-16 min-h-screen lg:min-h-0 lg:flex-1 lg:pb-0">
            {children}
          </main>
        </div>
      </UserProvider>
    );
  }

  // 未認証:
  // - PC: ロゴのみの固定ヘッダー（MobileNav と同じスタイル）
  // - スマホ: MobileNav ヘッダー（ハンバーガー非表示、ロゴのみ）
  return (
    <>
      {/* PC: ロゴのみの固定ヘッダー */}
      <header className="hidden lg:flex fixed inset-x-0 top-0 z-40 h-16 items-center border-b border-sidebar-border bg-sidebar px-6 shadow-sm">
        <Logo isDesktop={false} />
      </header>
      {/* スマホ: MobileNav ヘッダー（currentUser=null でハンバーガー非表示） */}
      <MobileNav
        currentUser={null}
        isLoading={false}
        menuList={[]}
        pathname={pathname}
      />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </>
  );
}
```

設計ポイント:
- ランディングページ (`/`) では `/api/users/me` を呼ばない（不要な API コール防止）
- 未認証 PC ヘッダーは `position: fixed` で MobileNav と同じスタイルを踏襲（既存 `Navigation` は `position: absolute` でコンテンツと重なるため使用しない）
- PC ヘッダーは `hidden lg:flex`、MobileNav は内部で `lg:hidden` なので表示が排他的になる

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/\(public\)/layout.tsx
git commit -m "feat: add public layout with auth-based layout switching"
```

---

### Task 6: 投稿一覧ページの移動 + 未ログイン対応

**Files:**
- Move: `frontend/src/app/(private)/posts/page.tsx` → `frontend/src/app/(public)/posts/page.tsx`
- Modify: 移動先のファイル

- [ ] **Step 1: ファイルを (public) に移動**

```bash
mkdir -p frontend/src/app/\(public\)/posts
mv frontend/src/app/\(private\)/posts/page.tsx frontend/src/app/\(public\)/posts/page.tsx
```

- [ ] **Step 2: 投稿一覧ページに認証状態の判定と LoginPromptModal を追加**

`frontend/src/app/(public)/posts/page.tsx` を修正。以下の変更を加える:

**2a. import に LoginPromptModal を追加:**

既存の import セクション（1-15行目）の後に追加:

```typescript
import LoginPromptModal from "@/components/features/auth/LoginPromptModal";
```

**2b. PostsPage コンポーネント内に認証状態と modal 用 state を追加:**

`export default function PostsPage()` の直後、既存の state 宣言の前に追加:

```typescript
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
```

**2c. 認証チェックの useEffect を追加:**

既存の `useEffect` の前に追加:

```typescript
  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false));
  }, []);
```

**注意:** この API 呼び出しは `(public)/layout.tsx` でも行っているため重複する。ただしレイアウトの結果を props で渡す方法は App Router の構造上難しく、各コンポーネントで独立して判定するのがシンプル。`/api/users/me` は軽量なのでパフォーマンスへの影響は小さい。

**2d. handleLikeToggle に認証チェック + 401 ハンドリングを追加:**

`handleLikeToggle` 関数を以下に変更:

```typescript
  const handleLikeToggle = async (e: React.MouseEvent, postId: number, currentLiked: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    // 未ログインならモーダル表示
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // 楽観的 UI 更新
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              current_user_liked: !currentLiked,
              likes_count: currentLiked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      )
    );

    try {
      const res = await fetch(`/api/posts/${postId}/likes`, {
        method: currentLiked ? "DELETE" : "POST",
        credentials: "include",
      });

      // 401: トークン期限切れ → モーダル表示
      if (res.status === 401) {
        setIsAuthenticated(false);
        setShowLoginModal(true);
        // ロールバック
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  current_user_liked: currentLiked,
                  likes_count: currentLiked ? p.likes_count + 1 : p.likes_count - 1,
                }
              : p
          )
        );
        return;
      }

      if (!res.ok && res.status !== 201 && res.status !== 204) {
        // 失敗時にロールバック
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  current_user_liked: currentLiked,
                  likes_count: currentLiked ? p.likes_count + 1 : p.likes_count - 1,
                }
              : p
          )
        );
      }
    } catch {
      // 失敗時にロールバック
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                current_user_liked: currentLiked,
                likes_count: currentLiked ? p.likes_count + 1 : p.likes_count - 1,
              }
            : p
        )
      );
    }
  };
```

変更点:
1. 先頭に `isAuthenticated` チェック追加
2. API レスポンスの 401 ステータスで `setIsAuthenticated(false)` + モーダル表示 + ロールバック

**2e. 新規投稿ボタンを条件分岐に変更:**

ヘッダーの新規投稿ボタン（232-237行目）を以下に変更:

```tsx
          {isAuthenticated ? (
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/posts/new?${searchParams.toString()}`}>
                <Plus className="h-4 w-4 mr-2" />
                新規投稿
              </Link>
            </Button>
          ) : (
            <Button
              className="w-full sm:w-auto"
              onClick={() => setShowLoginModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              新規投稿
            </Button>
          )}
```

**2f. 空状態の「最初の投稿を作成」ボタンも同様に条件分岐:**

空状態のボタン（320-325行目）を以下に変更:

```tsx
            {isAuthenticated ? (
              <Button asChild>
                <Link href={`/posts/new?${searchParams.toString()}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  最初の投稿を作成
                </Link>
              </Button>
            ) : (
              <Button onClick={() => setShowLoginModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                最初の投稿を作成
              </Button>
            )}
```

**2g. 投稿カードの Link を条件分岐に変更:**

投稿カード（329-392行目）の `<Link>` を条件分岐に変更。カードの中身を `cardContent` 変数に抽出し、認証状態で `<Link>` か `<div onClick>` かを切り替える:

```tsx
            {posts.map((post) => {
              const cardContent = (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 hover:shadow-md hover:border-primary/30 transition-all">
                  <h2 className="text-lg sm:text-xl font-semibold text-card-foreground mb-2 sm:mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  {/* タグバッジ */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
                      {post.tags.map((tag) => {
                        const config =
                          CATEGORY_CONFIG[
                            tag.category as keyof typeof CATEGORY_CONFIG
                          ];
                        return (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className={config?.badge}
                          >
                            {tag.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-primary/15 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span>{post.user?.display_name || "匿名"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="break-all">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleLikeToggle(e, post.id, post.current_user_liked)}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                          post.current_user_liked
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                      <span>{post.likes_count}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{post.comments_count}</span>
                    </div>
                  </div>
                </div>
              );

              return isAuthenticated ? (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}?${searchParams.toString()}`}
                  className="block"
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={post.id}
                  className="block cursor-pointer"
                  onClick={() => setShowLoginModal(true)}
                >
                  {cardContent}
                </div>
              );
            })}
```

**2h. JSX の末尾に LoginPromptModal を追加:**

`</div>` の閉じタグ（最後の `return` の末尾）の直前に追加:

```tsx
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
```

全体の return 末尾は以下のようになる:

```tsx
      </div>
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
```

- [ ] **Step 3: ビルド確認**

Run: `cd frontend && npx next build`
Expected: ビルドが成功する（型エラーなし）

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/\(public\)/posts/page.tsx
git rm frontend/src/app/\(private\)/posts/page.tsx
git commit -m "feat: move posts page to public route with login prompt modal"
```

---

## Chunk 4: 動作確認

### Task 7: 全体の動作確認

- [ ] **Step 1: 開発サーバーを起動して手動確認**

確認項目:

1. **未ログイン + `/posts` アクセス:** 投稿一覧が表示される
2. **未ログイン + PC:** ロゴのみの固定ヘッダーが表示、サイドバーなし
3. **未ログイン + スマホ:** MobileNav ヘッダー（ロゴのみ）が表示、ハンバーガーなし
4. **未ログイン + いいねクリック:** LoginPromptModal が表示される
5. **未ログイン + 投稿カードクリック:** LoginPromptModal が表示される
6. **未ログイン + 新規投稿ボタンクリック:** LoginPromptModal が表示される
7. **未ログイン + タグフィルター:** 正常に動作する
8. **ログイン済み + `/posts`:** サイドバー付きで通常表示
9. **ログイン済み + いいね/投稿カード/新規投稿:** 正常に動作する
10. **ログイン済み + `/` アクセス:** `/posts` にリダイレクトされる
11. **未ログイン + `/settings` アクセス:** `/login` にリダイレクトされる
12. **ランディングページ:** 変更な���で正常表示
13. **トークン期限切れ + いいねクリック:** LoginPromptModal が表示される

- [ ] **Step 2: 最終 Commit**

```bash
git add -A
git commit -m "feat: enable unauthenticated access to posts list page"
```
