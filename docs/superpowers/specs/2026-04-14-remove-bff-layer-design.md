# BFF層削除 設計書

## 背景

### 現状
Next.js Route Handlers（16ファイル）がBFF層として、ブラウザとRails API間のプロキシを担っている。主な役割は：
- ブラウザからのリクエストをRailsに転送（Cookieヘッダを付与）
- 認証時にRailsのレスポンスbodyからtokenを取り出し、Next.js側でSet-Cookieヘッダを再設定

### BFF導入の経緯
- CSRF対策で`SameSite=Lax`を使いたかった
- 開発環境（HTTP）でNext.js(3000)とRails(3001)がクロスオリジンのため、`SameSite=Lax`だとCookieが送信されない
- それを回避するためにBFF層を導入して同一オリジン化した

### 削除理由
- マイクロサービスではなくモノリシックなRails構成
- iOSアプリは未実装（将来構想のみ）
- 200ユーザー規模
- YAGNIに違反
- Next.jsの`rewrites`で同一オリジン化できるため、BFF層は不要

## 設計

### アーキテクチャ変更

**Before:**
```
ブラウザ → Next.js Route Handlers (port 3000) → Rails API (port 3001) → PostgreSQL
           [16個のroute.ts + relay-cookies.ts]
```

**After:**
```
ブラウザ → Next.js rewrites (port 3000) → Rails API (port 3001) → PostgreSQL
           [next.config.tsの設定のみ]
```

### 削除対象

#### Route Handlerファイル（16個）
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

#### ユーティリティ
- `frontend/src/lib/relay-cookies.ts`

#### ディレクトリ
- `frontend/src/app/api/` ディレクトリごと削除

### 追加するもの

#### `next.config.ts` に `rewrites` 設定
```ts
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: `${process.env.BACKEND_URL || "http://backend:3000"}/api/:path*`,
    },
  ];
}
```

### 変更しないもの

- **クライアント側のfetch URL**: `/api/posts` 等はそのまま。rewritesが同じパスを転送する
- **`credentials: "include"`**: 同一オリジンでも害はないのでそのまま残す
- **`middleware.ts`**: `jwt_token` Cookieの有無でリダイレクトするだけ。BFF層に依存していない
- **Rails側のCookie設定**: `httponly: true`, `same_site: :lax`, `secure: Rails.env.production?` は既に設定済み
- **Rails側のCORS設定**: `localhost:3000`許可 + `credentials: true` は設定済み（rewritesなら実質不要だが害はない）

### 精査が必要な箇所

認証系Route Handler（sign_in, sign_up, google_sign_in, password_reset）が、Railsのレスポンスbodyを加工していないか確認が必要。具体的には：
- tokenフィールドの除外・追加
- レスポンス構造の変換
- エラーハンドリングの差異

もしBFF側でbody加工をしている場合、フロントエンドのクライアントコードをRailsの直接レスポンス形式に合わせる必要がある。

### 本番環境（Railway）

本番では `tgline.dev` の同一ドメインで `/api/*` がRailsに向いている。`rewrites` は開発環境用で、本番ではRailwayのルーティングがそのまま機能する。

## リスク評価

| 項目 | リスク | 理由 |
|------|--------|------|
| 認証フロー | 低 | Railsが直接Set-Cookieを返すので動作する |
| CORS | 低 | rewritesで同一オリジンになるためCORS不要 |
| 本番デプロイ | 低 | 既に同一ドメインで動作中 |
| レスポンス形式差異 | 中 | BFFがbody加工していた場合、フロント側修正が必要 |
| ミドルウェア | 低 | Cookie読み取りのみでBFF非依存 |
