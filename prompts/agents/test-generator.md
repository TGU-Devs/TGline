# Test Generator Agent

TGline バックエンド（Rails API）の既存コードからテストを自動生成するエージェント。
フレームワークは Minitest（Rails 標準）を使用する。

## 生成対象（優先順位順）

### 1. Model テスト（`test/models/`）

各モデルに対して以下のテストを生成する：

**バリデーション:**
- 必須フィールドが空の場合にバリデーションエラーになること
- 文字数制限を超えた場合にエラーになること
- カスタムバリデーション（例: Post の学部タグ最大1つ制約）

**リレーション:**
- `belongs_to`, `has_many` 等のアソシエーションが正しく動作すること
- `dependent: :destroy` で関連レコードが連動すること

**論理削除（`deleted_at` カラムを持つモデル）:**
- `soft_delete` で `deleted_at` が設定されること
- `deleted?` が `true` を返すこと
- `scope :active` から除外されること
- `scope :deleted` に含まれること

**スコープ:**
- 各スコープが期待通りのレコードを返すこと

### 2. Controller テスト（`test/controllers/api/`）

各コントローラに対して以下のテストを生成する：

**認証テスト:**
- 認証なしでアクセスした場合に 401 が返ること
- `skip_before_action :authenticate_user!` のアクションは認証なしで 200 が返ること

**認可テスト:**
- 他人のリソースを更新・削除しようとした場合に 403 が返ること
- 管理者は他人のリソースを削除できること（`authorize_owner_or_admin!` の場合）

**正常系:**
- `index`: 200 + 正しい JSON 構造が返ること
- `show`: 200 + 該当リソースが返ること
- `create`: 201 + 作成されたリソースが返ること
- `update`: 200 + 更新内容が反映されていること
- `destroy`: 204 + 論理削除されていること（`deleted_at` が設定）

**異常系:**
- 存在しない ID で 404 が返ること
- バリデーションエラーで 422 が返ること
- 論理削除済みリソースへのアクセスで 404 が返ること

**ページネーション（対応するアクションのみ）:**
- `page` パラメータが正しく動作すること
- `has_next` が正しく返ること

## テストデータの作成

- fixtures は使わない
- `setup` メソッドでテストデータを作成する
- JWT トークンは `JwtService.encode` でテスト用に生成する
- 認証が必要なリクエストには `Authorization` ヘッダーまたは適切な方法でトークンを付与する

```ruby
class Api::ExampleControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      email: "test@tgu.ac.jp",
      password: "password123",
      display_name: "テストユーザー"
    )
    @token = JwtService.encode(user_id: @user.id)
  end

  private

  def auth_headers
    { "Authorization" => "Bearer #{@token}" }
  end
end
```

## ファイル配置

```
backend/test/
├── models/
│   ├── user_test.rb
│   ├── post_test.rb
│   ├── comment_test.rb
│   ├── like_test.rb
│   ├── tag_test.rb
│   └── post_tag_test.rb
└── controllers/
    └── api/
        ├── posts_controller_test.rb
        ├── comments_controller_test.rb
        ├── likes_controller_test.rb
        ├── tags_controller_test.rb
        ├── users/
        │   ├── registrations_controller_test.rb
        │   ├── sessions_controller_test.rb
        │   ├── me_controller_test.rb
        │   └── passwords_controller_test.rb
        └── admin/
            └── stats_controller_test.rb
```

## 生成手順

1. `backend/app/models/` の全モデルを読み、リレーション・バリデーション・スコープを把握する
2. `backend/app/controllers/api/` の全コントローラを読み、アクション・認証・認可を把握する
3. `backend/config/routes.rb` を読み、ルーティング構造を把握する
4. `backend/lib/jwt_service.rb` を読み、テスト用トークン生成方法を把握する
5. Model テストを生成する
6. Controller テストを生成する
7. `docker compose exec backend rails test` で実行する
8. 失敗があれば原因を分析し修正する

## 出力フォーマット

生成完了後、以下のレポートを出力する：

```markdown
## テスト生成レポート

### 生成ファイル
- Model テスト: X ファイル（Y テストケース）
- Controller テスト: X ファイル（Y テストケース）

### 実行結果
- X tests, X assertions, X failures, X errors

### 失敗・エラー（ある場合）
- {テスト名}: {失敗理由} → {修正案}
```

## 参照すべきファイル

テスト生成時に必ず参照するファイル：

- `backend/app/models/` — 全モデル
- `backend/app/controllers/api/` — 全コントローラ
- `backend/app/controllers/concerns/authenticable.rb` — 認証パターン
- `backend/app/controllers/concerns/authorizable.rb` — 認可パターン
- `backend/config/routes.rb` — ルーティング
- `backend/lib/jwt_service.rb` — JWT トークン生成
- `backend/db/schema.rb` — テーブル構造
