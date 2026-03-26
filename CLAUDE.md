# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドです。

## プロジェクト概要

東北学院大学向けの学内情報共有掲示板アプリ。Twitterライクな投稿で、授業・就活・サークル等の情報を共有する。Next.js フロントエンド + Rails APIバックエンド構成で、Docker で完全コンテナ化。

## 開発環境

開発はすべてDocker上で動作。ローカルにRuby/RailsやNode.jsのインストールは不要。

```bash
# 全サービス起動（db, backend, frontend）
docker compose up --build     # 初回
docker compose up             # 2回目以降
docker compose up -d          # バックグラウンド

# 停止
docker compose down           # データ保持
docker compose down -v        # DBボリュームも削除
```

**アクセス先:**
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001
- 開発用ログイン: admin@tgu.ac.jp / admin123（シードデータ）

### CI
- フロントエンドCI: PR時に実行、Node 22、`npm run build`（ダミー環境変数使用）
- バックエンドCIは未設定

## アーキテクチャ

### BFF（Backend-for-Frontend）パターン
ブラウザは**直接Railsにアクセスしない**。すべてのAPI呼び出しは Next.js Route Handlers（`frontend/src/app/api/`）を経由してRails（port 3001）にプロキシされる。JWTトークンはNext.js API層が管理するhttpOnly cookieに保存。

```
ブラウザ → Next.js Route Handlers (port 3000) → Rails API (port 3001) → PostgreSQL
```

### バックエンド: Rails API-only（`/backend`）
- **ルーティング**: すべて `/api` 名前空間配下 — `config/routes.rb` 参照
- **認証**: Devise + JWT（有効期限7日、v0ではリフレッシュトークンなし）
- **Google OAuth**: クライアントサイドSSO → Next.jsルート → RailsがIDトークンを検証
- **論理削除**: Posts, Comments, Users は `deleted_at` カラムで論理削除（物理削除しない）
- **モデル**: User, Post, Comment, Like, Tag, PostTag
- **タグカテゴリ**: enum（faculty, class, topic）— 学部タグは投稿あたり最大1つ

### フロントエンド: Next.js 15 App Router（`/frontend`）
- **ルートグループ**: `(public)` ランディング・認証ページ、`(private)` 認証必須ページ
- **ミドルウェア**（`src/middleware.ts`）: JWT cookieによる認証リダイレクト
- **UI**: shadcn/ui + Radix UI + TailwindCSS 4
- **パスエイリアス**: `@/` → `src/`
- **出力**: 本番用standaloneモード

### 主要ディレクトリ
- `frontend/src/app/api/` — BFFプロキシルート（Rails APIの構造をミラー）
- `frontend/src/components/features/` — 機能別コンポーネント（auth, posts等）
- `frontend/src/components/ui/` — shadcn/ui プリミティブ
- `backend/app/controllers/api/` — Rails APIコントローラ
- `backend/app/models/` — ActiveRecordモデル（バリデーション含む）
- `docs/API.md` — API仕様書
- `.cursor/cursor.md` — v0の詳細仕様書

## 環境変数

- `.env.local` — 開発用（コミット済み、docker-compose.ymlが参照）
- `.env` — 本番用（gitignore対象）
- `.env.template` — 本番用テンプレート

主要変数: `DATABASE_HOST`, `DATABASE_PASSWORD`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Prompts

開発時は `prompts/` 配下の定義を参照すること。
- `prompts/skills/` — 実装パターン・手順の定義
- `prompts/agents/` — 自動化タスクの定義

該当する作業の際は、対応するファイルを読んでから実行すること。

## 本番環境

- Railwayでフロント、バックエンド、DBをそれぞれデプロイしている。