# 東北学院大学用の掲示板アプリ

Next.js（フロントエンド）とRails（バックエンド）を使用した掲示板アプリケーションです。

## 📋 目次

- [必要な環境](#必要な環境)
- [Macでの環境構築](#macでの環境構築)
- [Windowsでの環境構築](#windowsでの環境構築)
- [共通のセットアップ手順](#共通のセットアップ手順)
- [環境変数について](#環境変数について)
- [アプリケーションの起動](#アプリケーションの起動)
- [アクセス方法](#アクセス方法)
- [トラブルシューティング](#トラブルシューティング)

## 必要な環境

- Docker Desktop（最新版推奨）
- Git
- エディタ（VSCode推奨）

## Macでの環境構築

### 1. Docker Desktopのインストール

1. [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) にアクセス
2. お使いのMacのチップに応じてダウンロード：
   - **Apple Silicon（M1/M2/M3など）**: Apple Silicon用をダウンロード
   - **Intel**: Intel用をダウンロード
3. ダウンロードした`.dmg`ファイルを開き、Dockerアイコンをアプリケーションフォルダにドラッグ
4. アプリケーションからDockerを起動し、初期設定を完了
5. メニューバーにDockerアイコンが表示され、`Docker Desktop is running`と表示されることを確認

### 2. Gitのインストール（未インストールの場合）

```bash
# Homebrewを使用する場合
brew install git

# または、Xcode Command Line Toolsをインストール
xcode-select --install
```

### 3. プロジェクトのクローン

```bash
git clone <リポジトリURL>
cd TGU
```

## Windowsでの環境構築

### 1. Docker Desktopのインストール

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) にアクセス
2. `Docker Desktop Installer.exe`をダウンロード
3. インストーラーを実行し、指示に従ってインストール
4. インストール後、Docker Desktopを起動
5. WSL 2（Windows Subsystem for Linux 2）が必要な場合、インストーラーが自動的に案内します
6. システム再起動を求められた場合は、再起動してください
7. Docker Desktopが起動し、タスクトレイにDockerアイコンが表示されることを確認

**注意**: Windows 11ではWSL 2が標準でサポートされています。Windows 10の場合は、[WSL 2のインストール手順](https://docs.microsoft.com/ja-jp/windows/wsl/install)に従ってください。

### 2. Gitのインストール（未インストールの場合）

1. [Git for Windows](https://git-scm.com/download/win) からダウンロード
2. インストーラーを実行し、デフォルト設定でインストール
3. インストール後、コマンドプロンプトまたはPowerShellで確認：
   ```powershell
   git --version
   ```

### 3. プロジェクトのクローン

**コマンドプロンプトまたはPowerShellで実行：**

```powershell
git clone <リポジトリURL>
cd TGU
```

**注意**: Windowsでは、パス区切り文字が`\`になりますが、Docker Composeの設定ファイル内では`/`を使用します。

## 共通のセットアップ手順

### 1. 環境変数の確認

開発用の環境変数は `.env.local` にすべて入っており、リポジトリにコミット済みです。
クローン後すぐに使えるので、追加の設定は不要です。

詳しくは [環境変数について](#環境変数について) を参照してください。

### 2. Dockerコンテナのビルドと起動

**Mac/Linux/Windows共通：**

```bash
docker compose up --build
```

初回起動時は、イメージのダウンロードとビルドに時間がかかります（5-10分程度）。

### 3. 起動確認

以下のメッセージが表示されれば起動成功です：

- `db-1`: `database system is ready to accept connections`
- `backend-1`: `Listening on http://0.0.0.0:3000`
- `frontend-1`: `Ready in X.Xs` と `Local: http://localhost:3000`

### 4. ブラウザ表示

こんな感じで出ればしっかりバックエンドとフロントエンド繋がって成功してます!
<img width="1440" height="900" alt="Image" src="https://github.com/user-attachments/assets/cb0f54db-47c8-406c-91f5-0334057e6a0a" />


## 環境変数について

環境変数ファイルは以下の3つに分かれています。

| ファイル | 用途 | Git管理 |
|---|---|---|
| `.env.local` | **開発環境用** — Docker Composeが参照する | コミットする |
| `.env` | **本番環境用** — 本番のDB接続情報等 | **gitignore（コミットしない）** |
| `.env.template` | 本番用のテンプレート | コミットする |

### 開発環境（ローカル）

クローンするだけでOK。`.env.local` が `docker-compose.yml` から参照されます。

### 本番環境

`.env.template` をコピーして `.env` を作成し、本番の値を設定してください。

```bash
cp .env.template .env
# .env を編集して本番の値を入れる
```

## アプリケーションの起動

### 初回起動後

初回起動時は、データベースのマイグレーションが自動的に実行されます。以下のようなメッセージが表示される場合がありますが、問題ありません：

```
Database 'backend_development' already exists
```

### 2回目以降の起動

```bash
docker compose up
```

### バックグラウンドで起動する場合

```bash
docker compose up -d
```

ログを確認する場合：

```bash
docker compose logs -f
```

## アクセス方法

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:3001
- **データベース**: localhost:5432（直接アクセスは通常不要）

## よく使うコマンド

### Docker Composeコマンド

```bash
# コンテナの起動
docker compose up

# バックグラウンドで起動
docker compose up -d

# コンテナの停止
docker compose down

# コンテナの停止とボリュームの削除（データベースのデータも削除されます）
docker compose down -v

# ログの確認
docker compose logs -f

# 特定のサービスのログのみ確認
docker compose logs -f backend
docker compose logs -f frontend

# コンテナ内でコマンドを実行
docker compose exec backend bash
docker compose exec frontend sh
```

### バックエンド（Rails）のコマンド

```bash
# Railsコンソールを開く
docker compose exec backend bundle exec rails console

# データベースのマイグレーション
docker compose exec backend bundle exec rails db:migrate

# データベースのリセット（開発環境のみ）
docker compose exec backend bundle exec rails db:reset

# データベースのシード実行
docker compose exec backend bundle exec rails db:seed
```

### フロントエンド（Next.js）のコマンド

```bash
# フロントエンドコンテナ内でシェルを開く
docker compose exec frontend sh

# パッケージの追加（コンテナ内で実行）
docker compose exec frontend npm install <package-name>
```

## トラブルシューティング

### 【個人向け】環境構築から起動までの詳細手順

標準の起動手順で問題が発生する場合、以下の手順で環境をクリーンな状態から構築できます。

#### 1. 環境変数ファイルの確認

プロジェクト内に複数の環境変数ファイルがあります。DB接続情報が一致していることを確認してください。

**確認ポイント:**

- **`.env.local`**: Docker Composeが参照（DBコンテナとbackendコンテナの両方に渡される）
- **`backend/.env`**: Rails が読み込む追加の環境変数

これらのファイルで、以下の値が一致している必要があります：

```bash
# .env.local
POSTGRES_PASSWORD=very_strong_password
DATABASE_PASSWORD=very_strong_password

# backend/.env
DATABASE_PASSWORD=very_strong_password  # ← .env.localと同じ値にする
```

**よくある問題:** `backend/.env` の `DATABASE_PASSWORD` が `postgres` など別の値になっていると、Rails が DB に接続できず `password authentication failed` エラーが発生します。

#### 2. 既存の環境をクリーンアップ（初回 or 問題がある場合）

```bash
# コンテナを停止
docker compose down

# DBボリュームの確認
docker volume ls

# DBボリュームを削除（データが消えるので注意！）
# ボリューム名は環境により異なる（例: bulletin-board-_db_data）
docker volume rm bulletin-board-_db_data

# または、コンテナとボリュームを一度に削除
docker compose down -v
```

#### 3. Docker Desktop の起動確認

Windows の場合、タスクトレイに Docker アイコンがあり、「Docker Desktop is running」となっていることを確認してください。

#### 4. アプリケーションの起動

```bash
# プロジェクトルートで実行
docker compose up --build
```

**起動の流れ:**

1. PostgreSQL（db）コンテナが起動
2. backend コンテナが起動し、以下を自動実行:
   - `bundle install`（gem のインストール）
   - `rails db:prepare`（DB作成・マイグレーション）
   - `rails db:seed`（初期データ投入）
   - `rails server`（Rails サーバー起動）
3. frontend コンテナが起動し、Next.js 開発サーバーを起動

#### 5. 起動確認

ターミナルのログで以下のメッセージを確認：

- `db-1`: `database system is ready to accept connections`
- `backend-1`: `Listening on http://0.0.0.0:3000`
- `frontend-1`: `Ready in ...` と `Local: http://localhost:3000`

**backend が起動しない場合:**

```bash
# backend のログだけを確認
docker compose logs backend

# よくあるエラー:
# - "password authentication failed" → 環境変数ファイルのパスワード不一致
# - "could not connect to server" → db コンテナが起動していない
```

#### 6. 管理者アカウントでログイン

ブラウザで `http://localhost:3000` を開き、以下でログイン：

- **メールアドレス**: `admin@tgu.ac.jp`
- **パスワード**: `admin123`

このアカウントは `rails db:seed` で自動作成されます。

#### 7. Rails コマンドを手動で実行する場合

PowerShell や bash で `rails` コマンドは直接使えません（Docker 内だけに Rails がインストールされているため）。

**コンテナ経由で実行する:**

```bash
# DB の作成・マイグレーション・seed を手動実行
docker compose exec backend bundle exec rails db:create db:migrate db:seed

# Rails コンソールを開く
docker compose exec backend bundle exec rails console

# 既存ユーザーを管理者にする例
docker compose exec backend bundle exec rails console
# コンソール内で:
# User.find_by(email: "your@email.com").update!(role: "admin")
```

#### 8. よくあるエラーと対処

| エラー | 原因 | 対処 |
|--------|------|------|
| `password authentication failed for user "postgres"` | `.env.local` と `backend/.env` のパスワード不一致 | 両ファイルの `DATABASE_PASSWORD` を同じ値に揃える |
| `connect ECONNREFUSED 172.20.0.x:3000` | backend が起動していない | `docker compose logs backend` でエラー確認。通常は上記の DB 認証エラーが原因 |
| `rails: 用語として認識されません`（Windows） | Rails がホストに入っていない | `docker compose exec backend bundle exec rails ...` のようにコンテナ経由で実行 |
| ログイン画面から `/settings` に行けない | `/api/users/me` が失敗している | backend が起動しているか、ログインできているかを確認 |

#### 9. 有効な URL 一覧

**フロントエンド（ブラウザで開く）:**

- 認証不要: `/`, `/login`, `/register`, `/auth-test`
- ログイン後: `/posts`, `/posts/new`, `/posts/[id]`, `/posts/[id]/edit`, `/notifications`, `/settings`

**バックエンド API（http://localhost:3001）:**

- ヘルスチェック: `GET /up`
- 認証: `POST /api/users/sign_up`, `/api/users/sign_in`, `DELETE /api/users/sign_out`
- ユーザー: `GET /api/users/me`, `PATCH /api/users/me`
- 投稿: `GET /api/posts`, `POST /api/posts`, `GET/PATCH/DELETE /api/posts/:id`

---

### ポートが既に使用されているエラー

**エラーメッセージ：**
```
Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:3001 -> 127.0.0.1:0: listen tcp 0.0.0.0:3001: bind: address already in use
```

**解決方法：**

1. 既存のコンテナを停止：
   ```bash
   docker compose down
   ```

2. ポートを使用しているプロセスを確認（Mac/Linux）：
   ```bash
   lsof -i :3001
   ```

3. ポートを使用しているプロセスを確認（Windows PowerShell）：
   ```powershell
   netstat -ano | findstr :3001
   ```

4. プロセスを停止するか、`docker-compose.yml`のポート番号を変更してください。

### 環境変数ファイルが見つからないエラー

**エラーメッセージ：**
```
env file /path/to/.env.local not found
```

**解決方法：**

プロジェクトルートに`.env.local`ファイルが存在することを確認してください。リポジトリにコミット済みなので、`git checkout .env.local`で復元できます。

### フロントエンドで`next: not found`エラー

**エラーメッセージ：**
```
sh: 1: next: not found
frontend-1 exited with code 127
```

**解決方法：**

1. コンテナを再ビルド：
   ```bash
   docker compose down
   docker compose up --build
   ```

2. `docker-compose.yml`の`frontend`サービスに`node_modules`のボリュームマウントが設定されているか確認してください。

### データベース接続エラー

**エラーメッセージ：**
```
could not connect to server: Connection refused
```

**解決方法：**

1. データベースコンテナが起動しているか確認：
   ```bash
   docker compose ps
   ```

2. データベースコンテナのログを確認：
   ```bash
   docker compose logs db
   ```

3. `.env.local`ファイルの設定が正しいか確認してください。

### Docker Desktopが起動しない（Mac）

1. Docker Desktopを完全に終了
2. システム再起動
3. Docker Desktopを再起動
4. それでも解決しない場合、Docker Desktopを再インストール

### Docker Desktopが起動しない（Windows）

1. WSL 2が正しくインストールされているか確認
2. Windowsの機能で「仮想マシンプラットフォーム」と「Windows Subsystem for Linux」が有効になっているか確認
3. Docker Desktopを管理者権限で実行
4. それでも解決しない場合、Docker Desktopを再インストール

## プロジェクト構成

```
TGU/
├── backend/           # Rails API（バックエンド）
│   ├── app/
│   ├── config/
│   └── db/
├── frontend/          # Next.js（フロントエンド）
│   ├── src/
│   └── public/
├── .env.local         # 開発環境用の環境変数（コミット済み）
├── .env               # 本番環境用の環境変数（gitignore）
├── .env.template      # 本番用テンプレート
├── docker-compose.yml # Docker Compose設定ファイル
└── Readme.md          # このファイル
```

## 技術スタック

- **フロントエンド**: Next.js 15.5.6, React 19.1.0, TypeScript, Tailwind CSS
- **バックエンド**: Ruby on Rails 7.2.2, PostgreSQL 15
- **インフラ**: Docker, Docker Compose

## 開発時の注意事項

- `.env`（本番用）は機密情報が含まれるため、Gitにコミットしないでください（`.gitignore`で除外済み）
- データベースのデータは`docker compose down -v`で削除されます
- コードの変更はホットリロードで自動反映されます（フロントエンド・バックエンド共に）

## サポート

問題が解決しない場合は、チームメンバーに相談するか、GitHubのIssuesに報告してください。
