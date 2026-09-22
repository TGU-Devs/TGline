# 環境構築ガイド

開発環境は次の2方式から選べる。

| 方式 | Next.js | Rails | PostgreSQL | 用途 |
|---|---|---|---|---|
| ローカル開発（推奨） | ローカル | ローカル | Docker | 日常の開発、高速なホットリロード |
| 全サービスDocker | Docker | Docker | Docker | 環境差異の確認、Docker構成の検証 |

どちらも次のURLを使用する。

| サービス | URL |
|---|---|
| Next.js | http://localhost:3000 |
| Rails API | http://localhost:3001 |
| Swagger UI | http://localhost:3001/api-docs |
| PostgreSQL | localhost:5432 |

## 共通準備

### 環境変数

`.env.local` がない場合は、テンプレートから作成する。

```bash
cp .env.local.example .env.local
```

`.env.local` はGit管理しない。Google OAuthやメール送信を使う場合は、必要な値を追加する。

### フロントエンドの依存管理

`frontend/package-lock.json` はGit管理する。

```bash
# 初回セットアップ・CI・壊れたnode_modulesの復旧
cd frontend
npm ci

# 依存の追加・更新
npm install <package-name>
```

`npm ci` は既存の `node_modules` を削除し、lockfileどおりに再構築する。依存を追加するときは `npm install`を使い、`package.json` と `package-lock.json` を一緒に更新する。

---

## A. ローカル開発（推奨）

Next.jsとRailsはMac上で実行し、PostgreSQL 15だけをDockerで起動する。

```text
Next.js（ローカル） → Rails（ローカル） → PostgreSQL（Docker）
```

### A-1. 前提条件

- Docker Desktop（PostgreSQL用）
- nvm
- Node.js 22（ルートの `.nvmrc`）
- rbenv + ruby-build
- Ruby 3.3.6（`backend/.ruby-version`）
- PostgreSQLクライアントライブラリ

Macでは次のように用意できる。

```bash
brew install rbenv ruby-build libpq
```

nvmとrbenv自体の初期化は公式手順に従う。

- https://github.com/nvm-sh/nvm
- https://github.com/rbenv/rbenv

### A-2. Node.jsとRubyの用意

```bash
# リポジトリルート
nvm install
nvm use

cd backend
rbenv install -s 3.3.6
rbenv local 3.3.6
gem install bundler
cd ..
```

### A-3. 初回セットアップ

```bash
./bin/setup-local
```

このスクリプトは次を実行する。

1. PostgreSQLコンテナを起動
2. `bundle install`
3. `rails db:prepare`
4. `rails db:seed`
5. `npm ci`

`pg` Gemのビルドで `pg_config` が見つからない場合は、パスをBundlerに設定する。

```bash
cd backend
bundle config set --local build.pg --with-pg-config="$(brew --prefix libpq)/bin/pg_config"
cd ..
./bin/setup-local
```

### A-4. 起動

```bash
./bin/dev
```

`bin/dev` はDBコンテナを起動し、RailsとNext.jsをローカルプロセスとして起動する。`Ctrl+C` でRailsとNext.jsは停止するが、DBコンテナは終了しない。

Next.jsの開発サーバーはTurbopackを標準で使用する。Turbopack固有の問題を切り分ける場合のみ、`frontend` で `npm run dev:webpack` を使用する。

ログを分けたい場合は、3つのターミナルで起動できる。

```bash
docker compose up -d db
./bin/dev-backend
./bin/dev-frontend
```

### A-5. Railsコマンド

Railsには `.env.local` の読み込みと、DBホストを `db` から `127.0.0.1` へ変換する処理が必要。`bin/rails-local` 経由で実行する。

```bash
./bin/rails-local console
./bin/rails-local db:migrate
./bin/rails-local db:seed
```

### A-6. ローカル開発の注意点

- 新しいターミナルでNode.jsが切り替わっていない場合は `nvm use` を実行する。
- `ruby -v` が3.3.6でない場合は、rbenvの初期化と `rbenv version` を確認する。
- RailsからDocker内のDBへは `127.0.0.1:5432` で接続する。`bin/load-local-env` が `DATABASE_HOST` を上書きする。
- `frontend/node_modules` はホスト上に作成されるため、エディタのTypeScript言語サーバーからも参照できる。
- Macのローカル開発では定期ポーリングを強制しない。Docker開発のファイル監視設定は `docker-compose.yml` の環境変数に限定する。
- 依存が壊れたり `Module not found` が出たりした場合は、`frontend` で `npm ci` を実行する。
- `npm ci` は `node_modules` を全削除するため、実行中のNext.jsを先に停止する。
- Active Storageなどが作る `backend/storage`、`tmp`、`log` はローカルファイルとして作成される。

---

## B. 全サービスDocker

Next.js、Rails、PostgreSQLをすべてDocker Composeで起動する。ローカルにNode.jsやRubyを用意しない場合や、Docker構成自体を検証する場合に使う。

```text
Next.js（Docker） → Rails（Docker） → PostgreSQL（Docker）
```

### B-1. 前提条件

- Docker Desktop
- Dockerイメージとボリューム用の十分な空き容量

Node.jsとRubyのバージョンはDockerfileが管理するため、nvmとrbenvは不要。

### B-2. 初回起動

```bash
docker compose up --build
```

起動時に次が実行される。

1. PostgreSQLの起動
2. Railsの `bundle install`、`db:prepare`、`db:seed`
3. Next.jsの `npm install`
4. RailsとNext.jsの開発サーバー起動

### B-3. 2回目以降

```bash
docker compose up
```

バックグラウンド起動する場合は次を使う。

```bash
docker compose up -d
docker compose logs -f
```

### B-4. コンテナ内のコマンド

```bash
# Rails
docker compose exec backend bundle exec rails console
docker compose exec backend bundle exec rails db:migrate
docker compose exec backend bundle exec rails db:seed

# Frontend
docker compose exec frontend npm install <package-name>
```

Docker内で依存を追加した場合でも、`package.json` と `package-lock.json` はbind mount経由でホスト側に更新されるため、両方をGit管理する。

### B-5. 停止

```bash
# DBデータと名前付きボリュームを保持
docker compose down

# DBとすべての名前付きボリュームも削除
docker compose down -v
```

### B-6. Docker開発の注意点

- `docker compose down -v` はDBデータ、Bundler依存、Next.jsキャッシュを削除する。ホストの `frontend/node_modules` は削除しない。
- Docker内の `npm install` はbind mount経由でホストの `frontend/node_modules` に依存を配置する。これにより、ホストで動くエディタのTypeScript言語サーバーからも型を参照できる。
- ローカルとDockerのNext.jsを切り替えた後に依存関係の問題が出た場合は、ローカル側で `npm ci` を実行してlockfileどおりに再構築する。
- `frontend/package-lock.json` を更新したら、フロントエンドイメージを再ビルドする。
- Docker Desktopのディスクが残り少ないと、`metadata.db: input/output error` でビルドやコンテナ作成が失敗する。
- `npm audit` の警告やnpm本体の更新通知は、それ自体で開発サーバーを停止させるエラーではない。

---

## 開発用ログイン

- メールアドレス: `admin@tgu.ac.jp`
- パスワード: `admin123`

## トラブルシューティング

### `Module not found` が出る

ローカル開発ではNext.jsを停止し、lockfileから依存を再構築する。

```bash
cd frontend
npm ci
```

Docker開発では、Docker用ボリュームとイメージを再構築する。

```bash
docker compose up --build frontend
```

### RailsからDBに接続できない

- ローカルRails: `DATABASE_HOST=127.0.0.1`
- Docker内Rails: `DATABASE_HOST=db`

ローカル開発では `bin/rails-local` または `bin/dev-backend` を使う。

### DockerがI/Oエラーになる

Macの空き容量を確認する。

```bash
df -h /
```

空き容量を確保してDocker Desktopを再起動しても復旧しない場合は、Dockerのビルドキャッシュや未使用イメージの削除を検討する。
