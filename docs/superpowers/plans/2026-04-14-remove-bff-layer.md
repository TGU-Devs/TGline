# BFF層削除 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js Route Handlers（BFF層）を削除し、`next.config.ts` の `rewrites` に置き換えることで、ブラウザ→Rails直接通信に移行する。

**Architecture:** 16個のRoute Handlerと`relay-cookies.ts`を削除し、`next.config.ts`に`rewrites`設定を追加する。クライアント側のfetch URLは変更不要。Railsが直接Set-Cookieヘッダーをブラウザに返す構成になる。

**Tech Stack:** Next.js 15 (rewrites), Rails API (既存Cookie/CORS設定を活用)

---

## Task 1: `next.config.ts` に rewrites 設定を追加

**Files:**
- Modify: `frontend/next.config.ts`

- [ ] **Step 1: `next.config.ts` に rewrites を追加**

現在のファイル内容のコメント「rewritesは使わない」を削除し、rewrites設定を追加する。

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    output: "standalone",

    // /api/* へのリクエストをRails APIに転送
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${process.env.BACKEND_URL || "http://backend:3000"}/api/:path*`,
            },
        ];
    },

    webpack: (config) => {
        config.watchOptions = {
            poll: 100,
            aggregateTimeout: 300,
        };
        return config;
    },
};

export default nextConfig;
```

- [ ] **Step 2: コミット**

```bash
git add frontend/next.config.ts
git commit -m "feat: add rewrites config to proxy /api/* to Rails backend"
```

---

## Task 2: BFF Route Handlerファイルを全削除

**Files:**
- Delete: `frontend/src/app/api/` ディレクトリ全体（16ファイル）

- [ ] **Step 1: `frontend/src/app/api/` ディレクトリを削除**

```bash
rm -rf frontend/src/app/api/
```

削除対象ファイル一覧（確認用）:
- `frontend/src/app/api/users/sign_in/route.ts`
- `frontend/src/app/api/users/sign_up/route.ts`
- `frontend/src/app/api/users/sign_out/route.ts`
- `frontend/src/app/api/users/google_sign_in/route.ts`
- `frontend/src/app/api/users/password/route.ts`
- `frontend/src/app/api/users/password_reset/route.ts`
- `frontend/src/app/api/users/route.ts`
- `frontend/src/app/api/users/me/route.ts`
- `frontend/src/app/api/posts/route.ts`
- `frontend/src/app/api/posts/[id]/route.ts`
- `frontend/src/app/api/posts/[id]/comments/route.ts`
- `frontend/src/app/api/posts/[id]/comments/[commentId]/route.ts`
- `frontend/src/app/api/posts/[id]/likes/route.ts`
- `frontend/src/app/api/tags/route.ts`
- `frontend/src/app/api/time/route.ts`
- `frontend/src/app/api/admin/stats/route.ts`

- [ ] **Step 2: コミット**

```bash
git add -A frontend/src/app/api/
git commit -m "refactor: remove all BFF Route Handler files (16 files)"
```

---

## Task 3: `relay-cookies.ts` を削除

**Files:**
- Delete: `frontend/src/lib/relay-cookies.ts`

- [ ] **Step 1: relay-cookies.ts のインポートが他ファイルに残っていないか確認**

```bash
grep -r "relay-cookies" frontend/src/ --include="*.ts" --include="*.tsx"
```

Expected: Route Handlerファイルは既に削除済みなのでヒットなし。もしヒットしたらそのimport文を削除する。

- [ ] **Step 2: `relay-cookies.ts` を削除**

```bash
rm frontend/src/lib/relay-cookies.ts
```

- [ ] **Step 3: コミット**

```bash
git add frontend/src/lib/relay-cookies.ts
git commit -m "refactor: remove relay-cookies.ts utility (no longer needed)"
```

---

## Task 4: CLAUDE.md のBFF関連記述を更新

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: CLAUDE.md のアーキテクチャ説明を更新**

以下の箇所を変更する:

1. 「BFF（Backend-for-Frontend）パターン」セクションを書き換え:

変更前:
```
### BFF（Backend-for-Frontend）パターン
ブラウザは**直接Railsにアクセスしない**。すべてのAPI呼び出しは Next.js Route Handlers（`frontend/src/app/api/`）を経由してRails（port 3001）にプロキシされる。JWTトークンはNext.js API層が管理するhttpOnly cookieに保存。
```

変更後:
```
### APIプロキシ
ブラウザからの `/api/*` リクエストは `next.config.ts` の `rewrites` 設定によりRails API（port 3001）に転送される。JWTトークンはRailsが直接httpOnly cookieとして設定する。
```

2. アーキテクチャ図を更新:

変更前:
```
ブラウザ → Next.js Route Handlers (port 3000) → Rails API (port 3001) → PostgreSQL
```

変更後:
```
ブラウザ → Next.js rewrites (port 3000) → Rails API (port 3001) → PostgreSQL
```

3. 主要ディレクトリセクションから以下を削除:
```
- `frontend/src/app/api/` — BFFプロキシルート（Rails APIの構造をミラー）
```

- [ ] **Step 2: コミット**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md to reflect BFF removal"
```

---

## Task 5: ビルド確認

- [ ] **Step 1: Next.jsのビルドが通ることを確認**

```bash
cd frontend && npm run build
```

Expected: ビルド成功。Route Handlerファイルが削除されても、rewritesは設定ファイルなのでビルドエラーにはならない。

- [ ] **Step 2: 未使用のインポートや参照がないか確認**

```bash
grep -r "relay-cookies\|from.*app/api" frontend/src/ --include="*.ts" --include="*.tsx"
```

Expected: ヒットなし。

---

## Task 6: Docker環境で動作確認

- [ ] **Step 1: Docker Composeで全サービスを起動**

```bash
docker compose up --build
```

- [ ] **Step 2: 認証フローの確認**

ブラウザで以下を確認:
1. `http://localhost:3000/login` でログインできる（admin@tgu.ac.jp / admin123）
2. ログイン後、ブラウザのDevTools → Application → Cookies に `jwt_token` が `HttpOnly` 属性付きで存在する
3. Set-Cookieヘッダーの送信元がRails（port 3001）であること（DevTools → Network → sign_inリクエストのレスポンスヘッダーで確認）

- [ ] **Step 3: データ取得の確認**

ブラウザで以下を確認:
1. `/posts` ページで投稿一覧が表示される
2. 投稿の新規作成ができる
3. コメントの投稿ができる
4. いいねの追加/解除ができる

- [ ] **Step 4: ログアウトの確認**

1. ログアウトボタンをクリック
2. `jwt_token` cookieが削除されている
3. ログインページにリダイレクトされる

- [ ] **Step 5: 問題がなければ最終コミット**

```bash
git add -A
git commit -m "refactor: complete BFF layer removal - replace with next.config.ts rewrites"
```
