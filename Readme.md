# 東北学院大学用の掲示板アプリ

Next.js（フロントエンド）とRails（バックエンド）を使用した掲示板アプリケーションです。

## 📋 目次

- [必要な環境](#必要な環境)
- [Macでの環境構築](#macでの環境構築)
- [Windowsでの環境構築](#windowsでの環境構築)
- [共通のセットアップ手順](#共通のセットアップ手順)
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

### 1. 環境変数ファイルの作成

プロジェクトルートの`backend`ディレクトリに`.env`ファイルを作成します。

**Mac/Linuxの場合：**

```bash
cd backend
cat > .env << 'EOF'
# Database configuration
DATABASE_HOST=db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=backend_development

# Rails configuration
RAILS_MAX_THREADS=5

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
cd ..
```

**Windowsの場合（PowerShell）：**

```powershell
cd backend
@"
# Database configuration
DATABASE_HOST=db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=backend_development

# Rails configuration
RAILS_MAX_THREADS=5

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
"@ | Out-File -FilePath .env -Encoding utf8
cd ..
```

**Windowsの場合（コマンドプロンプト）：**

手動で`backend/.env`ファイルを作成し、以下の内容をコピー＆ペーストしてください：

```
# Database configuration
DATABASE_HOST=db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=backend_development

# Rails configuration
RAILS_MAX_THREADS=5

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

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
env file /path/to/backend/.env not found
```

**解決方法：**

`backend/.env`ファイルが存在することを確認し、[環境変数ファイルの作成](#1-環境変数ファイルの作成)の手順に従って作成してください。

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

3. `.env`ファイルの設定が正しいか確認してください。

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
├── backend/          # Rails API（バックエンド）
│   ├── app/
│   ├── config/
│   ├── db/
│   └── .env          # 環境変数ファイル（要作成）
├── frontend/         # Next.js（フロントエンド）
│   ├── src/
│   └── public/
├── docker-compose.yml # Docker Compose設定ファイル
└── Readme.md         # このファイル
```

## 技術スタック

- **フロントエンド**: Next.js 15.5.6, React 19.1.0, TypeScript, Tailwind CSS
- **バックエンド**: Ruby on Rails 7.2.2, PostgreSQL 15
- **インフラ**: Docker, Docker Compose

## 開発時の注意事項

- `.env`ファイルには機密情報が含まれるため、Gitにコミットしないでください
- データベースのデータは`docker compose down -v`で削除されます
- コードの変更はホットリロードで自動反映されます（フロントエンド・バックエンド共に）

## サポート

問題が解決しない場合は、チームメンバーに相談するか、GitHubのIssuesに報告してください。
