# GraphQL学習環境

このGraphQL APIはローカル学習専用です。エンドポイントとGraphiQLは、Railsの`development`環境でのみルーティングされます。

## 起動

リポジトリルートでDocker Composeを起動します。

```bash
docker compose up --build
```

起動後、ブラウザでGraphiQLを開きます。

- GraphiQL: <http://localhost:3001/study_api/graphiql>
- GraphQL API: `POST http://localhost:3001/study_api/graphql`
- Next.js学習画面: <http://localhost:3000/graphql-practice>

## Queryを試す

最新の投稿を最大5件取得します。Ruby側の`created_at`は、GraphQLでは自動的に`createdAt`という名前で公開されます。

```graphql
query LatestPosts {
  posts(limit: 5) {
    id
    title
    body
    createdAt
    user {
      id
      displayName
    }
  }
}
```

IDを指定して1件取得する場合は、Variablesも使えます。

```graphql
query Post($id: ID!) {
  post(id: $id) {
    id
    title
    body
  }
}
```

```json
{
  "id": "1"
}
```

## Next.jsからQueryとMutationを試す

`/graphql-practice`は開発環境だけで表示されます。

- 投稿一覧はReact Server ComponentからApollo Clientの`query`で取得します。
- 投稿作成フォームはClient ComponentからServer Actionを呼びます。
- Server ActionはApollo Clientの`mutate`で`createPost`を実行します。

型定義は手書きせず、RailsのSchemaから次の順序で生成します。

```text
Rails Schema
  -> backend/graphql/study_api/schema.graphql
  -> GraphQL Code Generator
  -> frontendの共通Schema型と*.graphql.generated.ts
```

## スキーマファイルを生成する

`ikedayama`と同様に、Rubyで定義したSchemaからSDLファイルを生成できます。

```bash
docker compose exec backend bundle exec rails graphql:study_api:schema_generate
```

生成先は`backend/graphql/study_api/schema.graphql`です。

続けて、QueryとMutationのTypeScript型を生成します。

```bash
docker compose exec frontend npm run graphql:generate
```
