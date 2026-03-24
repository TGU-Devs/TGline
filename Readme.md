# TGU - 東北学院大学 学内情報共有掲示板

東北学院大学の学生向け情報共有プラットフォーム。授業・就活・サークルなどの学内情報を、Twitterライクな投稿形式で共有できる掲示板アプリケーション。

## アーキテクチャ

```
ブラウザ → Next.js BFF (port 3000) → Rails API (port 3001) → PostgreSQL
```

ブラウザは直接 Rails にアクセスせず、すべての API 呼び出しは Next.js の Route Handlers を経由する **BFF（Backend-for-Frontend）パターン** を採用。JWT トークンは httpOnly Cookie で管理。

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| バックエンド | Ruby on Rails 7.2 (API-only), Devise + JWT |
| データベース | PostgreSQL 15 |
| インフラ | Docker / Docker Compose（開発）, Railway（本番） |
| CI | GitHub Actions（フロントエンドビルド検証） |

## 主要機能

- **投稿・コメント** — タイトル+本文形式の投稿、コメント機能、いいね機能
- **タグシステム** — 学部(faculty)・授業(class)・トピック(topic)の3カテゴリ
- **匿名投稿** — 投稿・コメントの匿名化オプション
- **認証** — メール+パスワード / Google OAuth
- **管理者機能** — 統計ダッシュボード、コンテンツ管理
- **論理削除** — Posts, Comments, Users は `deleted_at` による論理削除

## プロジェクト構成

```
TGU/
├── frontend/                # Next.js 15 フロントエンド
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/    # 認証不要ページ（LP, ログイン, 登録）
│   │   │   ├── (private)/   # 認証必須ページ（投稿一覧, 設定等）
│   │   │   └── api/         # BFF プロキシルート
│   │   ├── components/
│   │   │   ├── features/    # 機能別コンポーネント
│   │   │   └── ui/          # shadcn/ui プリミティブ
│   │   ├── lib/             # ユーティリティ
│   │   └── middleware.ts    # 認証リダイレクト
│   └── package.json
│
├── backend/                 # Rails 7.2 API
│   ├── app/
│   │   ├── controllers/api/ # API コントローラ
│   │   └── models/          # ActiveRecord モデル
│   ├── config/
│   ├── db/                  # マイグレーション・シード
│   └── lib/                 # JWT, Google Auth サービス
│
├── docs/                    # ドキュメント
│   ├── API.md               # API 仕様書
│   ├── ER図.md              # データベース定義
│   ├── SETUP.md             # 環境構築ガイド
│   └── SECURITY_AUDIT.md    # セキュリティ監査レポート
│
├── docker-compose.yml       # 開発用 Docker Compose
├── docker-compose.prod.yml  # 本番用 Docker Compose
├── .env.local               # 開発用環境変数（コミット済み）
├── .env.template            # 本番用テンプレート
└── CLAUDE.md                # AI エージェント向けガイド
```

## クイックスタート

**前提条件**: Docker Desktop がインストールされていること

```bash
git clone <リポジトリURL>
cd TGU
docker compose up --build    # 初回（5-10分）
```

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:3001
- 開発用ログイン: `admin@tgu.ac.jp` / `admin123`

詳しい環境構築手順は [docs/SETUP.md](docs/SETUP.md) を参照。

## ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [docs/SETUP.md](docs/SETUP.md) | 環境構築・起動・トラブルシューティング |
| [docs/API.md](docs/API.md) | バックエンド API 仕様 |
| [docs/ER図.md](docs/ER図.md) | データベース ER 定義 |
| [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md) | セキュリティ監査レポート |
| [CLAUDE.md](CLAUDE.md) | AI エージェント向け開発ガイド |

## 環境変数

| ファイル | 用途 | Git管理 |
|---------|------|---------|
| `.env.local` | 開発環境用（Docker Compose が参照） | コミット済み |
| `.env` | 本番環境用 | **gitignore** |
| `.env.template` | 本番用テンプレート | コミット済み |

## 本番環境

Railway にフロントエンド・バックエンド・PostgreSQL をそれぞれデプロイ。
