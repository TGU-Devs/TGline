# AGENTS.md

このファイルは Codex / Claude Code など AI エージェントがこのリポジトリで作業する際のガイド。
`CLAUDE.md` はこのファイルへのシンボリックリンク。

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

### Rails API直接通信
ブラウザは `NEXT_PUBLIC_API_URL` で指定したRails APIを直接呼び出す。API通信には `frontend/src/lib/api.ts` の `apiFetch` を使用し、JWTはRailsが発行するHttpOnly Cookieで管理する。

```
ブラウザ → Rails API (開発: port 3001 / 本番: api.tgline.dev) → PostgreSQL
```

### バックエンド: Rails API-only（`/backend`）
- **ルーティング**: すべて `/api` 名前空間配下 — `config/routes.rb` 参照
- **認証**: Devise + JWT（有効期限7日、v0ではリフレッシュトークンなし）
- **Google OAuth**: クライアントサイドSSO → RailsがIDトークンを検証
- **論理削除**: Posts, Comments, Users は `deleted_at` カラムで論理削除（物理削除しない）
- **モデル**: User, Post, Comment, Like, Tag, PostTag
- **タグカテゴリ**: enum（`faculty`, `topic`）— 語彙は `Tag::DEFINITIONS` が正。学部タグは投稿あたり最大1つ

### フロントエンド: Next.js 15 App Router（`/frontend`）
- **ルートグループ**: `(public)` ランディング・認証ページ、`(private)` 認証必須ページ
- **ミドルウェア**（`src/middleware.ts`）: JWT cookieによる認証リダイレクト
- **UI**: shadcn/ui + Radix UI + TailwindCSS 4
- **パスエイリアス**: `@/` → `src/`
- **出力**: 本番用standaloneモード

### 主要ディレクトリ
- `frontend/src/lib/api.ts` — Rails API直接通信用クライアント
- `frontend/src/components/features/` — 機能別コンポーネント（auth, posts等）
- `frontend/src/components/ui/` — shadcn/ui プリミティブ
- `backend/app/controllers/api/` — Rails APIコントローラ
- `backend/app/models/` — ActiveRecordモデル（バリデーション含む）
- `backend/swagger/v1/swagger.yaml` — OpenAPI 仕様（API の正）

## 環境変数

- `.env.local` — 開発用（コミット済み、docker-compose.ymlが参照）
- `.env` — 本番用（gitignore対象）
- `.env.template` — 本番用テンプレート

主要変数: `DATABASE_HOST`, `DATABASE_PASSWORD`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `COOKIE_DOMAIN`

## Skills

スキルは `.agents/skills/<name>/SKILL.md` に置く（Agent Skills 標準）。
Codex は `.agents/skills/` を直接読み、Claude Code は `.claude/skills/` からのシンボリックリンク経由で同じ実体を読む。
実体は常に `.agents/` 側。`.claude/skills/` には手を入れない。

| スキル | 用途 |
|--------|------|
| `creating-api` | Rails API に新しいリソースを追加する手順 |
| `updating-openapi` | `swagger.yaml` を実装と同期する手順 |
| `pr-reviewer` | 差分のセキュリティ・アーキテクチャレビュー |
| `test-generator` | Minitest テストの生成 |
| `retro` | セッションの振り返り。指摘をハーネスに反映し、肥大化を剪定する |

スキルを新規追加するときは `.agents/skills/<name>/SKILL.md` を作り、`name` と `description` の frontmatter を必ず書く。
そのうえで `ln -s ../../.agents/skills/<name> .claude/skills/<name>` を張る。

## プロジェクト体制

- 学生3人の共同開発。専任のレビュアー・QA はいない
- 本番は Railway にフロント / バックエンド / DB をそれぞれデプロイしている
- **本番には実ユーザーとデータがある。** ローカルと同じ感覚で本番に触らない
- 3人とも Rails / Next.js を学習しながら開発している。
  変更の理由・影響範囲・前提知識を省略せず説明すること。「既知」として飛ばさない
- copilot-swe-agent / claude[bot] も PR を出す

## 開発方針

このリポジトリで作業する全エージェント（Codex / Claude Code / Copilot）に適用する。

- **テストはバックエンド（Rails / Minitest）のみ。** フロントエンドのテストは書かない
- バックエンドのテストもエージェントが自動では追加しない。
  依頼されたときに `test-generator` スキルで生成する
- **静的ツール・構文チェック・ビルドは実行しない。** 動作検証は各自が手元で行う
- **例外：本番DBに影響する操作** — マイグレーション、スキーマ変更、データ削除、
  `db:seed` の本番実行は、実行前に必ず確認を取り、ロールバック手段を併記すること
- 削除は物理削除（`destroy`）ではなく論理削除（`deleted_at` + `soft_delete`）を徹底する

## ハーネスの育て方

作業中に指摘・修正を受けたら、同じ誤りが繰り返されないよう定義ファイルに反映すること。
作業が一区切りついたら `retro` スキル（`/retro`）を呼ぶ。
受けた指摘の洗い出し・**書く場所の判定**・肥大化した記述の剪定まで行う。

個人の好み・作業スタイルはこのファイルに書かない（`~/.codex/AGENTS.md` へ）。
チーム全員と bot に効いてしまう。
**追加だけを続けると定義が肥大化し、書いてある指示が無視されるようになる。剪定も必ず行うこと。**
