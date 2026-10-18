---
name: test-generator
description: TGlineのRailsバックエンドへMinitestテストを追加する。ユーザーからテスト追加を明示的に依頼された場合に使用する。
---

# Test Generator

TGlineのRails APIへ、変更された振る舞いと回帰リスクに対応するMinitestテストを追加する。

テスト数や網羅率を機械的に増やすのではなく、TGline固有の仕様が壊れていないことを、保守しやすい最小限のテストで確認する。

## 基本方針

- Rails標準のMinitestを使用する
- テスト追加を明示的に依頼された場合のみ生成する
- 変更対象と、その変更によって壊れる可能性がある振る舞いを優先する
- Railsフレームワーク自体の挙動ではなく、アプリケーション固有の振る舞いをテストする
- 実装の内部構造ではなく、外部から観測できる結果を確認する
- 既存の近いテストを読み、命名、データ準備、認証方法、assertionの書き方を合わせる
- 必要なテストだけを追加し、全モデルや全CRUDの網羅を目的にしない
- フロントエンドのテストは生成しない

## 生成前に確認するもの

変更対象に応じて、必要なファイルだけを確認する。

- 対象のモデルまたはコントローラ
- 対象に最も近い既存テスト
- `backend/test/test_helper.rb`
- 使用するfixture
- `backend/config/routes.rb`
- `backend/db/schema.rb`
- 認証・認可に関係するconcern
- API仕様に関係する場合は`backend/swagger/v1/swagger.yaml`

全モデル・全コントローラを無条件に読み込まない。

## テスト対象の選び方

次の順番でテストケースを検討する。

1. 今回追加・変更された正常系
2. 認証・認可
3. データ不整合につながる異常系
4. 過去に不具合が発生した回帰ケース
5. 境界値や重要な業務ルール

単にコード上に分岐が存在するという理由だけで、すべての分岐をテストしない。

## テストデータ

### Fixtures

Rails標準のfixturesを使用できる。

fixturesは、複数のテストで共通して利用する安定した基準データに使用する。

例：

- 認証済みユーザー
- 未認証ユーザー
- 管理者
- Google OAuthユーザー
- 基準となる投稿や通知

fixtureには役割が分かる名前を付ける。

```ruby
users(:verified_user)
users(:unverified_user)
users(:admin)
```

`one`、`two`のように役割が分からない名前を新しく追加しない。

fixture間の関連は固定IDではなくfixture名で表現する。

```yaml
post:
  user: verified_user
```

fixtureは共通のデフォルトデータに限定し、テストで必要なすべての組み合わせをfixture化しない。

### テスト内で作成するデータ

次のデータは、テスト内または`setup`で明示的に作成する。

- テスト対象の操作によって作成・更新・削除されるレコード
- 境界値を表すレコード
- 同じモデルを異なる状態で複数必要とするケース
- そのテストだけで使用するデータ
- fixture化すると意図が分かりにくくなるデータ

テストデータは可能な限り決定的な値を使用する。再現性を損なうランダム値は、ユニーク制約を回避する必要がある場合に限定する。

### FactoryBot

現時点ではFactoryBotを追加しない。

fixturesとテスト内のレコード作成だけではデータ準備が複雑になり、同じ生成処理が多数のテストで繰り返されるようになった場合に、別途導入を検討する。

### `fixtures :all`

新しいテストを`fixtures :all`へ暗黙的に依存させない。

`fixtures :all`の削除やfixture読み込み方式の変更は、既存テスト全体へ影響するため、テスト追加のついでには行わない。変更する場合は、影響範囲を確認して独立した作業として提案する。

## Modelテスト

Modelテストでは、Active Recordの設定そのものではなく、TGline固有のドメインロジックを確認する。

優先するもの：

- カスタムバリデーション
- 複数カラムや関連モデルをまたぐ制約
- スコープが返すレコード
- 論理削除
- 状態遷移
- 認証セッションのローテーションや失効
- コールバックによって発生する重要な副作用

原則として追加しないもの：

- `belongs_to`や`has_many`が宣言されていることだけを確認するテスト
- Rails標準のpresence validationを機械的に列挙するテスト
- getterやsetterを呼ぶだけのテスト
- privateメソッドを直接呼ぶテスト

論理削除では、メソッドの戻り値だけでなく永続化後の状態を確認する。

```ruby
record.soft_delete

assert_predicate record.reload, :deleted?
assert_not_includes Model.active, record
```

## APIテスト

Rails APIのリクエストテストには`ActionDispatch::IntegrationTest`を使用する。

ルーティングを通してHTTPリクエストを送り、次を必要に応じて確認する。

- HTTPステータス
- JSONレスポンス
- DBの状態変化
- Cookieの発行・更新・削除
- 認証・認可
- 論理削除後の状態

ステータスコードだけで正常性を判断しない。

```ruby
assert_difference -> { Post.count }, 1 do
  post "/api/posts", params: valid_params
end

assert_response :created

body = JSON.parse(response.body)
assert_equal "投稿内容", body["content"]
```

更新では、レスポンスだけでなくDBを再読み込みする。

```ruby
patch "/api/posts/#{post.id}", params: update_params

assert_response :ok
assert_equal "変更後", post.reload.content
```

## 認証テスト

TGlineのJWTはHttpOnly Cookieで管理する。

Authorizationヘッダーを前提にせず、`test_helper.rb`の認証ヘルパーを使用する。

```ruby
sign_in_as(user)
```

認証機能自体をテストするときは、実際のログイン、リフレッシュ、ログアウトのエンドポイントを通し、Cookieと認証セッションの状態を確認する。

主な確認対象：

- 認証Cookieがない場合は`401 Unauthorized`
- 権限がない場合は`403 Forbidden`
- アクセストークン更新時にCookieが更新される
- 無効または期限切れのリフレッシュトークンは拒否される
- ログアウト時にCookieと認証セッションが失効する
- パスワード変更後に既存の認証セッションが失効する

JWTの生成が必要な場合は、現在の`JwtService`の公開インターフェースを確認して使用する。スキル内の固定された呼び出し形式を信用しない。

## Assertion

Railsが提供する目的別assertionを優先する。

- 作成・削除件数：`assert_difference`
- 件数が変わらないこと：`assert_no_difference`
- 属性や状態の変化：`assert_changes`
- 変化しないこと：`assert_no_changes`
- HTTPレスポンス：`assert_response`
- 例外：`assert_raises`
- collectionへの包含：`assert_includes` / `assert_not_includes`
- predicate：`assert_predicate` / `assert_not_predicate`

1つのテストに複数のassertionを置いてもよい。ただし、1つのテストでは1つの振る舞いを説明する。

## テスト名

テスト名は、条件と期待結果が分かる日本語の文章にする。

```ruby
test "期限切れのリフレッシュトークンではアクセストークンを更新できない" do
end
```

`test "refresh"`や`test "works"`のような曖昧な名前は避ける。

## Helperへの抽出

複数のテストで繰り返される準備処理だけをhelperへ抽出する。

適切な例：

- 認証Cookieの設定
- JSONレスポンスの解析
- 複雑なリクエストパラメータの共通部分

避ける例：

- assertionを大量に隠すhelper
- テスト対象の操作自体を隠すhelper
- 何のデータが作られるか分からない汎用Factory
- 1か所からしか呼ばれないhelper

テストを読むだけで、準備、操作、期待結果が追える状態を保つ。

## 生成手順

1. ユーザーが求めているテスト範囲を確認する
2. 対象実装と最も近い既存テストを読む
3. 変更された振る舞いと回帰リスクを整理する
4. 追加するテストケースを絞る
5. fixtureとテスト内データ作成の役割を決める
6. 既存の認証・データ準備パターンへ合わせて実装する
7. 変更内容と各テストの目的を説明する

テスト実行、静的解析、ビルドは自動では行わない。ユーザーから明示的に依頼された場合のみ、プロジェクトの現在の開発環境に合った方法で実行する。

## 配置

```text
backend/test/
├── fixtures/
├── models/
├── controllers/
│   └── api/
├── integration/
├── jobs/
├── mailers/
└── test_helper.rb
```

- Model：`test/models/`
- 単一APIエンドポイントの振る舞い：既存構成に合わせて`test/controllers/api/`
- 複数エンドポイントをまたぐ重要なフロー：`test/integration/`
- Job：`test/jobs/`
- Mailer：`test/mailers/`

既存の配置と異なる場所へ移動する場合は、テスト追加とは分けて提案する。

## 完了報告

以下を簡潔に報告する。

- 追加・変更したテストファイル
- 各テストが守る振る舞い
- fixtureとテスト内作成データの使い分け
- 実行した検証とその結果
- 実行していない検証
- 残っているリスクや追加候補

実行していないテストを、成功したものとして報告しない。
