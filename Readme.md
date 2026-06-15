# TGU - 東北学院大学 学内情報共有掲示板

東北学院大学の学生向け情報共有プラットフォーム。授業・就活・サークルなどの学内情報を、Twitterライクな投稿形式で共有できる掲示板アプリケーション。

## 制作背景

- 既存の大学生向け掲示板アプリは大学を横断的に管理しているようなアプリで一つの大学で投稿の荒らし行為が起きていても管理が行き届いてないような状況だった。実際に一定数のユーザーがいたのにも関わらずそのような状況だったのでこれを自分の大学向けにセキュリティとUIUXを向上したアプリとして出せば需要あるのではないかと思い作成に至った。
## 技術選定とその意図

本プロジェクトはチーム開発を前提に、メンバーの既存スキル・キャッチアップ容易性・運用コストを重視して技術選定を行った。


- **Next.js（App Router）**: チームメンバーが書き慣れているかつ、RSCによるSEO対策など、エコシステムが充実しており開発速度や将来的な拡張性を考慮して選定

- **Rails API**: MVCや「設定より規約」という思想により、プロジェクト構成が統一されやすく、新規参加者でもコードの構造を理解しやすいと考えたため

- **JWT + httpOnly Cookie**: Next.jsとRailsを分離した構成で、将来的なモバイルアプリ展開やAPIの利用範囲拡大も考え、トークンベース認証を選択しました。一方で、JWTにも失効管理などの課題があるため、WebのみならSession認証も十分選択肢になると考えています。

- **Docker**: 開発環境差異を減らし、初学者でも同じ手順で起動できるようにするため

- **Railway**: サーバー構築やデプロイ基盤、実行環境の管理などをマネージドに任せられるため採用しました。実際に開発当初はさくらVPSで運用していたのですが、SSH設定やサーバー管理などに工数がかかってしまい、本質的な機能追加などの開発速度が落ちていると感じRailwayを選定しました。

- **Cloudfrare**:ドメイン管理に加え、WAFやBot対策などセキュリティ機能もマネージドで利用でき、運用負荷を下げられると考え採用しました。


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

詳しい環境構築手順は [docs/SETUP.md](docs/SETUP.md) を参照。

## ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [docs/SETUP.md](docs/SETUP.md) | 環境構築・起動・トラブルシューティング |
| [docs/API.md](docs/API.md) | バックエンド API 仕様 |
| [docs/ER図.md](docs/ER図.md) | データベース ER 定義 |
| [CLAUDE.md](CLAUDE.md) | AI エージェント向け開発ガイド |

## 環境変数

| ファイル | 用途 | Git管理 |
|---------|------|---------|
| `.env.local` | 開発環境用（Docker Compose が参照） | コミット済み |
| `.env.template` | 本番用テンプレート | コミット済み |

## 本番環境

Railway にフロントエンド・バックエンド・PostgreSQL をそれぞれデプロイ。
