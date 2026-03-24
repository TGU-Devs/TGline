# 環境構築ガイド

## 前提条件

- **Docker Desktop**（最新版推奨）
- **Git**
- **エディタ**（VSCode 推奨）

> ローカルに Ruby/Rails や Node.js のインストールは不要。すべて Docker コンテナ上で動作します。

---

## 環境構築

### Mac

1. [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) をダウンロード
   - Apple Silicon (M1/M2/M3): Apple Silicon 用
   - Intel: Intel 用
2. `.dmg` を開き、Docker をアプリケーションフォルダにドラッグ
3. Docker を起動し、メニューバーに「Docker Desktop is running」と表示されることを確認

Git が未インストールの場合:
```bash
brew install git
# または
xcode-select --install
```

### Windows

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) をダウンロード・インストール
2. WSL 2 が必要な場合はインストーラーの案内に従う
3. Docker Desktop を起動し、タスクトレイで動作を確認

> Windows 10 の場合は [WSL 2 のインストール手順](https://docs.microsoft.com/ja-jp/windows/wsl/install) を参照。

Git が未インストールの場合:
- [Git for Windows](https://git-scm.com/download/win) からインストール

---

## プロジェクトのセットアップ

### 1. クローン

```bash
git clone <リポジトリURL>
cd TGU
```

### 2. 環境変数の確認

開発用の環境変数は `.env.local` に含まれ、リポジトリにコミット済み。クローン後すぐに使えます。

| ファイル | 用途 | Git管理 |
|---------|------|---------|
| `.env.local` | 開発環境用（Docker Compose が参照） | コミット済み |
| `.env` | 本番環境用 | **gitignore** |
| `.env.template` | 本番用テンプレート | コミット済み |

### 3. 初回起動

```bash
docker compose up --build
```

初回はイメージのダウンロードとビルドで 5〜10 分かかります。

**起動の流れ:**
1. PostgreSQL（db）コンテナが起動
2. backend コンテナが起動 → `bundle install` → `rails db:prepare` → `rails db:seed` → `rails server`
3. frontend コンテナが起動 → Next.js 開発サーバー起動

### 4. 起動確認

ターミナルで以下のログを確認:
- `db-1`: `database system is ready to accept connections`
- `backend-1`: `Listening on http://0.0.0.0:3000`
- `frontend-1`: `Ready in X.Xs`

### 5. アクセス

| サービス | URL |
|---------|-----|
| フロントエンド | http://localhost:3000 |
| バックエンド API | http://localhost:3001 |
| DB（直接アクセスは通常不要） | localhost:5432 |

### 6. 開発用ログイン

- メールアドレス: `admin@tgu.ac.jp`
- パスワード: `admin123`

このアカウントは `rails db:seed` で自動作成されます。

---

## よく使うコマンド

### Docker Compose

```bash
docker compose up             # 起動（2回目以降）
docker compose up --build     # 再ビルドして起動
docker compose up -d          # バックグラウンド起動
docker compose down           # 停止（データ保持）
docker compose down -v        # 停止 + DBボリューム削除
docker compose logs -f        # ログ確認
docker compose logs -f backend  # 特定サービスのログ
```

### Rails（コンテナ内で実行）

```bash
docker compose exec backend bundle exec rails console           # コンソール
docker compose exec backend bundle exec rails db:migrate         # マイグレーション
docker compose exec backend bundle exec rails db:reset           # DBリセット
docker compose exec backend bundle exec rails db:seed            # シード実行
```

### フロントエンド（コンテナ内で実行）

```bash
docker compose exec frontend sh                                  # シェル
docker compose exec frontend npm install <package-name>          # パッケージ追加
```

> `rails` や `npm` コマンドはホストではなくコンテナ内で実行してください。

---

## URL 一覧

### フロントエンド（ブラウザ）

| パス | 認証 | 内容 |
|------|------|------|
| `/` | 不要 | ランディングページ |
| `/login` | 不要 | ログイン |
| `/register` | 不要 | 新規登録 |
| `/posts` | 必要 | 投稿一覧 |
| `/posts/new` | 必要 | 新規投稿 |
| `/posts/[id]` | 必要 | 投稿詳細 |
| `/posts/[id]/edit` | 必要 | 投稿編集 |
| `/settings` | 必要 | ユーザー設定 |

### バックエンド API（http://localhost:3001）

| メソッド | パス | 内容 |
|---------|------|------|
| GET | `/up` | ヘルスチェック |
| POST | `/api/users/sign_up` | 新規登録 |
| POST | `/api/users/sign_in` | ログイン |
| DELETE | `/api/users/sign_out` | ログアウト |
| GET / PATCH | `/api/users/me` | 自分の情報 |
| GET / POST | `/api/posts` | 投稿一覧 / 作成 |
| GET / PATCH / DELETE | `/api/posts/:id` | 投稿詳細 / 更新 / 削除 |

---

## トラブルシューティング

### ポートが既に使用されている

```
Error: exposing port TCP 0.0.0.0:3001 -> bind: address already in use
```

```bash
# Mac/Linux: ポートを使っているプロセスを確認
lsof -i :3001

# Windows PowerShell
netstat -ano | findstr :3001

# 解決: コンテナを停止してから再起動
docker compose down
docker compose up
```

### DB接続エラー / パスワード認証失敗

```
password authentication failed for user "postgres"
```

`.env.local` の `POSTGRES_PASSWORD` と `DATABASE_PASSWORD` が一致しているか確認。不一致の場合は値を揃えて、DBボリュームを削除して再起動:

```bash
docker compose down -v
docker compose up --build
```

### `next: not found` エラー

```bash
docker compose down
docker compose up --build
```

### 環境変数ファイルが見つからない

```
env file /path/to/.env.local not found
```

リポジトリにコミット済みなので `git checkout .env.local` で復元。

### Docker Desktop が起動しない

**Mac**: Docker を完全終了 → システム再起動 → Docker 再起動。解決しなければ再インストール。

**Windows**: WSL 2 が有効か確認。「仮想マシンプラットフォーム」と「Windows Subsystem for Linux」が有効になっているか確認。管理者権限で実行。

---

## 開発時の注意事項

- `.env`（本番用）は **絶対に Git にコミットしない**（`.gitignore` で除外済み）
- `docker compose down -v` でDBデータが削除される
- コードの変更はホットリロードで自動反映（フロントエンド・バックエンド共に）
- Rails コマンドは `docker compose exec backend bundle exec rails ...` で実行
