# OpenAPI 仕様更新スキル

Rails API にエンドポイントを追加・変更・削除した際に、OpenAPI 仕様（`backend/swagger/v1/swagger.yaml`）を同期するためのスキル。

## 概要

- 仕様ファイル: `backend/swagger/v1/swagger.yaml`
- フォーマット: OpenAPI 3.0.3
- Swagger UI: http://localhost:3001/api-docs（Docker起動時）

## いつ実行するか

以下の作業をしたら、**必ず**このスキルに従って `swagger.yaml` を更新する：

- Rails コントローラにアクションを追加した
- 既存アクションのリクエスト/レスポンス形式を変更した
- `config/routes.rb` にルートを追加・変更・削除した
- モデルのバリデーションを変更した（→ エラーレスポンスに影響）

## 作業手順

### Step 1: 対象コントローラを確認

追加・変更したコントローラを読み、以下を把握する：

- HTTPメソッドとパス
- 認証の要否（`skip_before_action :authenticate_user!` の有無）
- 認可レベル（`authorize_owner!` / `authorize_owner_or_admin!` / `authorize_admin!`）
- リクエストパラメータ（`params.require` / `params.permit`）
- レスポンスの形式（`xxx_response` メソッドの戻り値）
- エラーレスポンス（各 status code と JSON 形式）

### Step 2: swagger.yaml を更新

`backend/swagger/v1/swagger.yaml` を編集する。

#### パス定義の追加

`paths:` セクションに、適切なカテゴリコメントの下に追加する。

```yaml
paths:
  # ============================================================
  # カテゴリ名
  # ============================================================
  /api/resource_names:
    get:
      tags: [TagName]
      summary: 日本語で簡潔な説明
      operationId: camelCaseの操作ID
      security:                          # 認証必要な場合のみ
        - cookieAuth: []
      parameters:                        # クエリパラメータがある場合
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                # インラインまたは $ref
```

#### 規約

| 項目 | ルール |
|------|--------|
| パス | Rails のルーティングそのまま（例: `/api/posts/{post_id}/comments`） |
| operationId | camelCase（例: `listPosts`, `createComment`, `deletePost`） |
| tags | 既存タグを使う。新しいタグが必要なら `tags:` セクション（ファイル冒頭）にも追加 |
| security | 認証必要なエンドポイントには `security: [cookieAuth: []]` を付ける |
| summary | 日本語で簡潔に（例: 「投稿一覧を取得」「コメントを作成」） |
| description | 認可条件や特殊な挙動がある場合のみ追加 |

#### パスパラメータの再利用

既存の `$ref` を使う：

```yaml
parameters:
  - $ref: '#/components/parameters/PostId'      # name: id, in: path
  - $ref: '#/components/parameters/PostIdPath'   # name: post_id, in: path
```

新しい親リソースのパスパラメータが必要なら `components/parameters/` に追加する。

#### スキーマ定義の追加

新しいリソースのレスポンス形式は `components/schemas/` に追加する。

```yaml
components:
  schemas:
    ResourceName:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        user:
          type: object
          nullable: true
          properties:
            id:
              type: integer
            display_name:
              type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
```

**ルール:**
- Rails の `xxx_response` メソッドの出力と1対1で対応させる
- 日時は `format: date-time`
- nullable なフィールドは `nullable: true`
- 論理削除されたユーザーの場合 `user` が `null` になるケースを考慮
- enum 値はモデルの定義と合わせる

#### エラーレスポンスの再利用

既存のエラースキーマを使う：

```yaml
# 単一エラー
$ref: '#/components/schemas/Error'        # { error: string }

# 複数エラー
$ref: '#/components/schemas/Errors'       # { errors: [string] }

# バリデーションエラー
$ref: '#/components/schemas/ValidationErrors'  # { errors: [string] }

# 401
$ref: '#/components/responses/Unauthorized'
```

### Step 3: YAML 構文チェック

編集後、構文が正しいか確認する：

```bash
python3 -c "import yaml; yaml.safe_load(open('backend/swagger/v1/swagger.yaml')); print('OK')"
```

## 完了チェックリスト

- [ ] 追加・変更したエンドポイントが `paths:` に反映されている
- [ ] リクエストボディのスキーマがコントローラの `params.permit` と一致している
- [ ] レスポンススキーマがコントローラの `xxx_response` メソッドと一致している
- [ ] 認証が必要なエンドポイントに `security` が設定されている
- [ ] 認可条件（本人のみ/管理者のみ等）が `description` に記載されている
- [ ] 新しいリソースの場合、`components/schemas/` にスキーマが追加されている
- [ ] 新しいタグの場合、`tags:` セクション（ファイル冒頭）に追加されている
- [ ] YAML 構文チェックが通る

## 参照ファイル

- **OpenAPI 仕様**: `backend/swagger/v1/swagger.yaml`
- **rswag 設定**: `backend/config/initializers/rswag_api.rb`, `backend/config/initializers/rswag_ui.rb`
- **ルーティング**: `backend/config/routes.rb`
