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

## スキーマファイルを生成する

`ikedayama`と同様に、Rubyで定義したSchemaからSDLファイルを生成できます。

```bash
docker compose exec backend bundle exec rails graphql:study_api:schema_generate
```

生成先は`backend/graphql/study_api/schema.graphql`です。
