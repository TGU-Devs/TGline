# BFF API ルート追加スキル

TGline の BFF（Backend-for-Frontend）パターンに従って、新しい API リソースを追加するためのスキル。

## アーキテクチャ

```
ブラウザ → Next.js Route Handlers (port 3000) → Rails API (port 3001) → PostgreSQL
```

ブラウザは直接 Rails にアクセスしない。すべて Next.js API ルート経由。

## 作業手順

新しいリソースを追加する際は、以下の順序で5レイヤーを実装する。

### Step 1: Rails Model（`backend/app/models/`）

既存パターン（`post.rb`, `comment.rb`）に従う。

```ruby
class ResourceName < ApplicationRecord
  # リレーション
  belongs_to :user

  # バリデーション
  validates :name, presence: true, length: { maximum: 100 }

  # 論理削除スコープ（deleted_at カラムがある場合は必須）
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }

  def soft_delete
    update(deleted_at: Time.current)
  end

  def deleted?
    deleted_at.present?
  end
end
```

**ルール:**
- 論理削除が必要なリソースは `deleted_at:datetime` カラムを migration に含める
- `scope :active` と `soft_delete` メソッドを必ず定義
- 物理削除（`destroy`）は使わない

### Step 2: Rails Controller（`backend/app/controllers/api/`）

`Api::` namespace 配下に作成。既存パターン（`posts_controller.rb`）に従う。

```ruby
# frozen_string_literal: true

module Api
  class ResourceNamesController < ApplicationController
    # 認証不要のアクションがあれば skip
    # skip_before_action :authenticate_user!, only: [:index]
    before_action :set_resource, only: [:show, :update, :destroy]

    def index
      resources = ResourceName.active.includes(:user).order(created_at: :desc)
      render json: resources.map { |r| resource_response(r) }, status: :ok
    end

    def show
      render json: resource_response(@resource), status: :ok
    end

    def create
      resource = current_user.resource_names.build(resource_params)
      if resource.save
        render json: resource_response(resource), status: :created
      else
        render json: { errors: resource.errors }, status: :unprocessable_entity
      end
    end

    def update
      authorize_owner!(@resource)
      if @resource.update(resource_params)
        render json: resource_response(@resource.reload), status: :ok
      else
        render json: { errors: @resource.errors }, status: :unprocessable_entity
      end
    end

    def destroy
      authorize_owner_or_admin!(@resource)
      @resource.soft_delete
      head :no_content
    end

    private

    def set_resource
      @resource = ResourceName.active.find_by(id: params[:id])
      return if @resource
      render json: { errors: ['ResourceName not found'] }, status: :not_found
    end

    def resource_params
      params.require(:resource_name).permit(:field1, :field2)
    end

    def resource_response(resource)
      {
        id: resource.id,
        # ... フィールド
        user: resource.user ? {
          id: resource.user.id,
          display_name: resource.user.display_name
        } : nil,
        created_at: resource.created_at.iso8601,
        updated_at: resource.updated_at.iso8601
      }
    end
  end
end
```

**ルール:**
- 認可は `authorize_owner!`（本人のみ）または `authorize_owner_or_admin!`（本人+管理者）を使う
- レスポンス形式は `xxx_response` プライベートメソッドで統一
- 日時は `.iso8601` で返す
- 削除は `soft_delete`、レスポンスは `head :no_content`
- ページネーションが必要な場合は `posts_controller.rb` の `per_page + 1` パターンを参照

### Step 3: Rails Routes（`backend/config/routes.rb`）

`namespace :api` ブロック内に追加。

```ruby
namespace :api do
  # 既存ルート...

  # 新規リソース
  resources :resource_names, only: [:index, :show, :create, :update, :destroy]

  # ネストする場合（例: posts の comments のように）
  resources :parents do
    resources :children, only: [:index, :create, :destroy]
  end
end
```

### Step 4: BFF Route Handler（`frontend/src/app/api/`）

Rails のルート構造をミラーする。Cookie を転送し、レスポンスをそのまま返す。

**コレクション（`/api/resource-names/route.ts`）:**

```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString
      ? `${BACKEND_URL}/api/resource_names?${queryString}`
      : `${BACKEND_URL}/api/resource_names`;

    const backendRes = await fetch(url, {
      method: "GET",
      headers: { Cookie: cookie },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Get resource_names error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/resource_names`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Create resource_name error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**個別リソース（`/api/resource-names/[id]/route.ts`）:**

```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${BACKEND_URL}/api/resource_names/${id}`, {
      method: "GET",
      headers: { Cookie: cookie },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Get resource_name error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get("cookie") || "";
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/resource_names/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Update resource_name error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${BACKEND_URL}/api/resource_names/${id}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });

    if (backendRes.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Delete resource_name error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**ルール:**
- `BACKEND_URL` は `process.env.BACKEND_URL || "http://backend:3000"` 固定
- Cookie は `request.headers.get("cookie") || ""` で取得して転送
- Next.js 15 の `params` は `Promise` なので `await params` が必要
- DELETE の 204 レスポンスは `new NextResponse(null, { status: 204 })` で処理
- Rails 側の URL はスネークケース（`resource_names`）、Next.js 側のフォルダはケバブケース（`resource-names`）

### Step 5: TypeScript 型定義（`frontend/src/types/`）

```typescript
// frontend/src/types/resourceName.ts
export type ResourceName = {
  id: number;
  // ... フィールド
  user: {
    id: number;
    display_name: string;
  } | null;
  created_at: string;
  updated_at: string;
};
```

**ルール:**
- Rails の `xxx_response` メソッドの出力と1対1で対応させる
- 日時フィールドは `string`（ISO 8601）
- nullable なリレーションは `| null`

## 完了チェックリスト

新しいリソースを追加したら、以下を確認：

- [ ] Rails migration が作成され、`docker compose exec backend rails db:migrate` が成功
- [ ] Rails model にバリデーション・スコープ・リレーションが定義されている
- [ ] Rails controller の全アクションで認証・認可が適切に設定されている
- [ ] `config/routes.rb` にルーティングが追加されている
- [ ] BFF route が Rails のエンドポイントを正しくミラーしている
- [ ] TypeScript 型が Rails のレスポンス形式と一致している
- [ ] 論理削除対象なら `deleted_at`, `scope :active`, `soft_delete` がある
- [ ] ネストリソースの場合、親リソースの存在チェック（`set_parent`）がある

## 参照ファイル

パターンに迷ったら以下を参照：
- **CRUD の模範**: `backend/app/controllers/api/posts_controller.rb`
- **ネストリソース**: `backend/app/controllers/api/comments_controller.rb`
- **BFF コレクション**: `frontend/src/app/api/posts/route.ts`
- **BFF 個別+ネスト**: `frontend/src/app/api/posts/[id]/route.ts`
- **型定義**: `frontend/src/types/user.ts`
- **ルーティング**: `backend/config/routes.rb`
