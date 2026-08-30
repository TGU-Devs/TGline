# Rails API リソース追加手順

TGline に新しい API リソースを追加するときの実装手順。

## アーキテクチャ

```text
ブラウザ → Rails API → PostgreSQL
```

Next.js Route Handlers による API プロキシは作成しない。
フロントエンドは `frontend/src/lib/api.ts` の `apiFetch` を使用する。

## 実装手順

1. `backend/app/models/` にModelを追加し、既存の関連・バリデーション・論理削除パターンに従う
2. `backend/app/controllers/api/` にControllerを追加し、認証・認可を設定する
3. `backend/config/routes.rb` の `namespace :api` 配下にRouteを追加する
4. フロントエンドから `apiFetch` でRailsのパスを直接呼び出す
5. Railsレスポンスと一致するTypeScript型を定義する
6. `prompts/skills/updating-openapi/instruction.md` に従ってOpenAPIを更新する

## Frontend例

```typescript
import { apiFetch } from "@/lib/api";

const response = await apiFetch("/api/resource_names", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resource_name: values }),
});
```

## ルール

- RailsのベースURLを画面やコンポーネントに記述しない
- Cookieは `apiFetch` が `credentials: "include"` で送信する
- `FormData` 使用時は `Content-Type` を手動設定しない
- `204 No Content`のレスポンスに対して `response.json()` を呼ばない
- 更新・削除では `authorize_owner!` または `authorize_owner_or_admin!` を使用する
- 論理削除対象では `active` スコープと `soft_delete` を定義する

## 完了チェックリスト

- [ ] Modelの関連・バリデーション・論理削除が既存規約に沿っている
- [ ] Controllerの認証・認可が適切である
- [ ] `config/routes.rb` にルートがある
- [ ] フロントエンドが `apiFetch` を使用している
- [ ] TypeScript型とRailsレスポンスが一致している
- [ ] OpenAPI仕様を更新した
