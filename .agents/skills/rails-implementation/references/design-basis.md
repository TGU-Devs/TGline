# Rails Implementation Design Basis

この資料は、rails-implementationスキルの判断根拠を記録する。

Rails Wayを絶対的な規則として扱わず、資料の性質を区別する。

## 根拠の区分

1. Rails公式Guide・API：フレームワークの仕様と公式推奨
2. Rails Doctrine：Railsの設計思想
3. DHH・37signalsの実装例：Rails作者と実運用チームの設計選択
4. TGlineの方針：プロジェクト規模と既存コードに合わせた判断

DHHや37signalsの設計を、Railsで許される唯一の設計として扱わない。

## Rails Doctrine

- https://rubyonrails.org/doctrine

採用する考え方：

- Rails標準の組み合わせを最初の選択肢にする
- 必要性が明確になるまで置き換えを遅らせる
- 不要な抽象化や境界を増やさない
- 1つの設計パラダイムを絶対視しない
- 統合されたシステムの理解しやすさを重視する

「Rails Wayだから」という説明で終わらず、現在の実装で何が単純になるかを説明する。

## Active Record

- https://api.rubyonrails.org/v7.2/classes/ActiveRecord.html
- https://guides.rubyonrails.org/v7.2/active_record_basics.html

Active RecordはDBアクセスだけでなく、永続化されるデータに関する業務ロジックも扱う。

Modelを単なるデータ構造にして、業務ロジックをすべて別レイヤーへ移すことを標準にしない。

## Active ModelとPORO

- https://guides.rubyonrails.org/active_model_basics.html

テーブルを持たない概念でも、validationやModelとしてのAPIが必要な場合はActive Modelを利用できる。

すべてのドメインロジックをActive Recordへ置く必要はない。

## Controller

- https://guides.rubyonrails.org/v7.2/action_controller_overview.html

Controllerはリクエストを解釈し、Modelを操作し、レスポンスを返すHTTP境界である。

単純なCRUDでControllerからModelを直接操作することは、Railsの通常の構成である。

## ValidationとDB制約

- https://guides.rubyonrails.org/v7.2/active_record_validations.html
- https://guides.rubyonrails.org/v7.2/active_record_migrations.html

Model validationはユーザーへエラーを返しやすいが、競合状態でDB整合性を完全には保証しない。

一意性、外部キー、必須値など、破れてはいけない条件には適切なDB制約も検討する。

## Transaction

- https://api.rubyonrails.org/v7.2.3/classes/ActiveRecord/Transactions/ClassMethods.html

複数のSQLが一体として成功または失敗する必要がある場合にtransactionを使用する。

saveとdestroyはActive Record自身がtransactionで保護しているため、単一操作を機械的にtransactionで囲まない。

## Callback

- https://guides.rubyonrails.org/active_record_callbacks.html

callbackはModelのライフサイクルへ処理を結び付ける。

callbackメソッド内でsaveやupdateなどの副作用を起こすと、予期しない状態変化につながる可能性がある。

外部処理では、DB commit前後の違いを考慮する。

## Active Job

- https://guides.rubyonrails.org/v7.2/active_job_basics.html

Jobは非同期処理とqueue backendの境界を提供する。

業務ルールの唯一の所有者にするのではなく、必要に応じてModelやMailerなどの公開APIを呼び出す。

## Routing

- https://guides.rubyonrails.org/v7.2/routing.html

resourceful routingはHTTP verb、URL、Controller action、CRUD操作を規約で対応付ける。

独自actionを追加する前に、操作自体をresourceとして表現できるか検討する。

## DHHのConcernに関する考え方

- https://signalvnoise.com/posts/3372-put-chubby-models-on-a-diet-with-concerns

DHHは、Modelが持つ役割をTaggableやSearchableなどのConcernとして整理する方法を示している。

これは古い記事であり、Concernを常に使用するという公式ルールではない。役割が明確で、ホストModelのAPIとして自然な場合の設計例として扱う。

## 37signalsのVanilla Rails

- https://world.hey.com/jorge/code-i-like-iv-vanilla-rails-is-plenty-71d0465c

37signalsでは、Active RecordとPOROをドメインモデルとして扱い、ControllerやJobから直接公開APIを呼び出している。

採用する考え方：

- 単純なCRUDに中間層を必須化しない
- Modelへ自然なドメインAPIを用意する
- 複雑な内部処理は別のオブジェクト群へ委譲できる
- Serviceなどの技術的分類より、Signupのようなドメイン概念で命名する
- application layerを設けること自体を目的にしない

これはRails公式仕様ではなく、37signalsで実運用されている設計例である。
