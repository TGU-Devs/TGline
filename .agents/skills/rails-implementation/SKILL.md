---
name: rails-implementation
description: TGlineのRailsバックエンドで、新機能やリファクタリング時の責務配置をRails標準に沿って判断して実装する。Controller、Active Record、Concern、PORO、Jobなどの置き場所に設計判断が必要なときに使う。テスト生成、OpenAPI更新、完成済み差分のレビューだけが目的の場合は使わない。
---

# Rails Implementation

TGlineのRailsバックエンドを、Rails標準の機能と既存のコード構成を優先して実装する。

「Rails Way」を固定的なレイヤー構造として扱わない。不要な抽象化を避け、ドメインの責務が自然に読める最小限の構造を選ぶ。

## 判断の優先順位

1. ユーザーが指定した要件
2. AGENTS.mdにあるプロジェクト方針
3. TGlineの類似実装
4. プロジェクトで使用しているRailsバージョンの公式Guide・API
5. Rails DoctrineやRails開発者の実践例
6. 一般的な設計パターン

一般論を理由に、既存のプロジェクト構造を無条件に置き換えない。

RailsやgemのAPI、callback、transactionなどのバージョン依存仕様を判断するときは、記憶だけで回答せず、プロジェクトのバージョンと公式資料を確認する。

設計根拠が必要な場合は、[references/design-basis.md](references/design-basis.md)を読む。

## 実装前の確認

変更対象に応じて必要なファイルだけを確認する。

- 対象のController、Model、Job、Mailer
- 最も近い既存実装
- backend/config/routes.rb
- backend/db/schema.rb
- 関連するmigration
- 認証・認可に関係するconcern
- API変更を伴う場合はbackend/swagger/v1/swagger.yaml

全Controllerや全Modelを無条件に読み込まない。

実装前に、少なくとも次を説明してユーザーの承認を得る。

- 変更する振る舞い
- 責務を置く場所
- その場所を選ぶ理由
- DBやAPIへの影響
- 追加しない抽象化と、その理由

## 責務の置き場所

| 場所 | 主な責務 |
|---|---|
| Controller | リクエストの解釈、認証・認可、パラメータ、ドメイン操作の呼び出し、HTTPレスポンス |
| Active Record Model | 永続化されるドメインデータ、validation、関連、scope、状態遷移、データに密接な業務ルール |
| Active Model / PORO | テーブルを持たないが、名前を持つドメイン概念や複数入力の検証 |
| Concern | ModelやControllerが持つ、名前を付けられる一貫した役割 |
| Job | 非同期実行、再試行、キューとの境界 |
| Mailer | メールの組み立てと配送 |
| Database | 外部キー、一意制約、NOT NULLなど、競合時にも破れてはいけない整合性 |

単純なCRUDでは、ControllerからActive Recordを直接操作してよい。中間層を作ること自体を目的にしない。

## Controller

ControllerはHTTP境界を担当する。

適切な責務：

- パラメータの許可
- 認証・認可
- Modelの検索
- ドメイン操作の呼び出し
- HTTPステータスとJSONレスポンス
- 既知の例外をHTTPレスポンスへ変換すること

Controllerへ置かないもの：

- 複数箇所から利用される業務ルール
- レコードの状態遷移の詳細
- 長いデータ整形や計算
- 再利用される複雑なquery
- 非同期処理の本体

Controllerの行数だけを理由に抽象化しない。処理の所有者がどこかで判断する。

## Active Record Model

永続化されるデータに関する業務ルールは、まず責務を持つActive Recordモデルへ置く。

適切な例：

- 認証セッションの開始、ローテーション、失効
- 投稿やコメントの論理削除
- 通知の作成条件
- レコードの状態遷移
- 関連レコードを含む一貫した操作
- ドメイン上の意味を持つscope

Modelには、呼び出し側が業務上の意図を読める公開メソッドを用意する。

~~~ruby
authentication_session.rotate!(refresh_token)
post.soft_delete
notification.mark_as_read!
~~~

永続化の詳細をControllerへ漏らすより、意味のあるドメイン操作として表現する。

ただし、すべてを1つのActive Recordクラスへ詰め込まない。異なる責務が実際に複雑化した場合は、Concernまたは具体的なドメインオブジェクトへの抽出を検討する。

## Concern

Concernは、ModelやControllerが持つ一貫した役割を整理するために使用する。

適切な例：

~~~ruby
class Post < ApplicationRecord
  include SoftDeletable
end
~~~

Concern名は、ホストオブジェクトが持つ役割として読める名前にする。

避けるもの：

- 名前を付けにくいメソッドの寄せ集め
- 無関係なcallbackや関連の混在
- 単にModelの行数を減らすためだけの抽出
- Concern同士の暗黙的な読み込み順依存

1つのModelだけで使うConcernも許容するが、独立した役割として説明できる場合に限定する。

## POROとActive Model

次の場合は、テーブルを持たないドメインオブジェクトを検討する。

- 複数モデルを扱う処理に自然な所有者がいない
- 入力値の検証自体が1つのドメイン概念を表す
- Active Recordへ置くと、モデル本来の責務から外れる
- 処理が十分に複雑化し、独立した名前と公開APIを持てる

クラス名は、技術的な処理名ではなくドメイン概念を表す。

推奨：

~~~ruby
Project::InvitationToken::Signup
RefreshTokenRotation
CourseImport
~~~

原則として避ける：

~~~ruby
UserService
AuthenticationService
CourseService
PostManager
~~~

Serviceという接尾辞自体を禁止しない。ただし、責務の曖昧さを隠していないか確認する。

## 抽出の判断

新しいオブジェクトを追加する前に確認する。

1. 既存のModelが自然な所有者ではないか
2. 単純なCRUDやModelメソッドで十分ではないか
3. 同じ処理が実際に複数箇所へ現れているか
4. 抽出後のクラスへ具体的な責務名を付けられるか
5. 抽出によって処理の流れが読みやすくなるか
6. テストやtransactionの境界が明確になるか

将来複雑になるかもしれない、という理由だけでレイヤーを追加しない。

## Transaction

複数のDB操作が「全部成功するか、全部失敗するか」でなければ不整合になる場合にtransactionを使用する。

適切な例：

- コメント作成と対応する通知作成
- リフレッシュトークンの検証とローテーション
- 親レコードと関連レコードの同時更新

単一のsave!やdestroy!を囲むだけのtransactionは原則追加しない。Active Recordのsaveとdestroyは、それ自体がtransactionで保護される。

transactionを使用するときは、次を説明できるようにする。

- 一体として成功させるDB操作
- 途中で失敗した場合に起こる不整合
- 必要なlockと競合条件
- transaction外へ出すべき外部処理

HTTP通信、メール送信などの外部処理は、DBのrollbackでは元に戻せない。必要に応じてafter_commitやJobを検討する。

## Callback

callbackはModelのライフサイクルと常に一体である処理に限定する。

適切な候補：

- 保存前の属性正規化
- コミット後に必ず行うJobのenqueue
- レコードのライフサイクルに不可欠な処理

避けるもの：

- callback内での追加のsaveやupdate
- 呼び出し元から見えない大きな状態変更
- 外部APIへの同期通信
- 実行順序へ強く依存するcallbackの連鎖

ユーザー操作として明示的に呼ぶ方が分かりやすい処理は、公開メソッドとして表現する。

## ValidationとDB制約

ユーザーへエラーを返すための業務ルールはModel validationで表現する。

競合状態でも破れてはいけない整合性はDB制約でも保護する。

例：

- 必須値：validationと必要に応じてNOT NULL
- 一意性：uniqueness validationとunique index
- 関連の整合性：associationとforeign key

Model validationだけで、同時実行時の一意性が保証されるとは考えない。

## Job

Jobは非同期実行の境界として使用する。

Jobへ置くもの：

- 非同期で実行する処理
- 再試行方針
- キューの選択
- 引数から対象を取得し、ドメイン操作を呼び出す処理

Jobへ置かないもの：

- Controllerや同期処理からも必要になる業務ルール
- レコードの正しい状態を決める唯一のロジック
- Jobでしか再利用できないように隠されたドメイン判断

Jobは可能な限りModelやMailerなどの公開APIを呼び出す。

## Routing

新しいRouteは、まずresourceful routingで表現できるか検討する。

~~~ruby
resources :posts, only: [:index, :show, :create, :update, :destroy]
~~~

状態変更や子リソースも、ドメイン上のresourceとして表現できる場合は、独立したControllerを検討する。

独自actionを禁止しないが、動詞を増やす前にresourceとして命名できないか確認する。

## 避ける設計

- Modelをデータだけの入れ物にして、すべての業務ロジックをServiceへ移す
- ControllerとModelの間に常に中間層を置く
- Service、Manager、Handlerへ無関係な処理を集める
- 行数だけを基準にModelやControllerを分割する
- Rails標準機能を確認せず独自実装やgemを追加する
- 実在しない将来要件のために抽象化する
- Rails Wayという言葉だけを根拠に判断する

## 完了時の説明

実装後は次を説明する。

- どの責務をどこへ置いたか
- なぜその場所が自然なのか
- transactionやlockが必要な理由
- 追加しなかった抽象化
- 代替案を採用しなかった理由
- 公式資料で確認したバージョン依存仕様
- 未実行の検証
