# TGU掲示板 API仕様（v0）

## 前提

- バックエンド：Rails 7（APIモード）
- 認証：Devise
- 全APIはログイン必須
- 削除はすべて論理削除
- 管理者機能・DM機能は v0 では実装しない

---

## 共通仕様

### 認証エラー

未ログイン時は以下を返す。

```json
{
  "error": "unauthorized"
}
````

---

### 共通エラーレスポンス

各エンドポイントでエラーが発生した場合、以下の形式で返す。

#### バリデーションエラー

```json
{
  "errors": {
    "title": ["can't be blank"],
    "body": ["is too short (minimum is 10 characters)"]
  }
}
```

#### その他のエラー

```json
{
  "errors": ["エラーメッセージ"]
}
```

---

## 投稿（Posts）

### GET /posts

#### 概要

投稿一覧を取得する。
論理削除された投稿は含めない。

#### クエリ（任意）

* category: Tagのcategory enum（faculty / class / topic）
* tag_id: タグID

#### レスポンス例

```json
[
  {
    "id": 1,
    "title": "経済学のレポートについて",
    "body": "〇〇先生の授業について質問です",
    "anonymous": true,
    "tags": [
      { 
        "id": 3, 
        "name": "ミクロ経済学",
        "category": "class"
      }
    ],
    "likes_count": 5,
    "user": null,
    "created_at": "2026-01-01T12:00:00Z"
  }
]
```

※ anonymous=true の場合、user は必ず null。

---

### POST /posts

#### 概要

投稿を作成する。

#### リクエスト

```json
{
  "title": "質問です",
  "body": "この授業って出席ある？",
  "anonymous": false,
  "tag_ids": [1, 3]
}
```

#### バリデーション

* title：必須
* body：必須
* tag_ids：任意（Tagのcategory enumで制約あり）
* anonymous：必須（boolean）

#### エラーレスポンス

バリデーションエラー時：

```json
{
  "errors": {
    "title": ["can't be blank"],
    "body": ["is too short (minimum is 10 characters)"]
  }
}
```

権限エラー時（他人の投稿を削除しようとした場合など）：

```json
{
  "errors": ["You don't have permission to delete this post"]
}
```

---

### GET /posts/:id

#### 概要

投稿詳細を取得する。

#### レスポンス

GET /posts と同形式。

---

### DELETE /posts/:id

#### 概要

自分の投稿を論理削除する。

#### 制約

* 投稿者本人のみ可能
* 物理削除は禁止

#### レスポンス

成功時：204 No Content

エラー時：

```json
{
  "errors": ["You don't have permission to delete this post"]
}
```

---

## いいね（Likes）

### POST /posts/:id/likes

#### 概要

投稿にいいねを付与する。

#### 制約

* 同一ユーザーは同一投稿に1回のみ

#### レスポンス

```json
{
  "liked": true,
  "likes_count": 5
}
```

#### エラーレスポンス

既にいいね済みの場合：

```json
{
  "errors": ["You have already liked this post"]
}
```

---

### DELETE /posts/:id/likes

#### 概要

いいねを解除する。

#### レスポンス

```json
{
  "liked": false,
  "likes_count": 4
}
```

#### エラーレスポンス

いいねが存在しない場合：

```json
{
  "errors": ["Like not found"]
}
```

---

---

## タグ（Tags）

### GET /tags

#### 概要

タグ一覧を取得する。

#### クエリ（任意）

* category: Tagのcategory enum（faculty / class / topic）でフィルタ

#### レスポンス例

```json
[
  { 
    "id": 1, 
    "name": "ミクロ経済学",
    "category": "class"
  },
  { 
    "id": 2, 
    "name": "法学部",
    "category": "faculty"
  }
]
```

※ Tagのcategoryはenum（faculty / class / topic）

---

## コメント（Comments）

### POST /posts/:id/comments

#### 概要

コメントを作成する。

#### リクエスト

```json
{
  "body": "自分も同じ疑問あった",
  "anonymous": false
}
```

#### バリデーション

* body：必須
* anonymous：必須（boolean）

#### レスポンス

```json
{
  "id": 1,
  "body": "自分も同じ疑問あった",
  "anonymous": false,
  "user": {
    "id": 2,
    "display_name": "太郎"
  },
  "created_at": "2026-01-01T12:10:00Z"
}
```

#### エラーレスポンス

```json
{
  "errors": {
    "body": ["can't be blank"]
  }
}
```

---

### GET /posts/:id/comments

#### 概要

コメント一覧を取得する。

#### レスポンス

```json
[
  {
    "id": 1,
    "body": "わかる",
    "anonymous": false,
    "user": {
      "id": 2,
      "display_name": "太郎"
    },
    "created_at": "2026-01-01T12:10:00Z"
  },
  {
    "id": 2,
    "body": "私も同じです",
    "anonymous": true,
    "user": null,
    "created_at": "2026-01-01T12:15:00Z"
  }
]
```

※ anonymous=true の場合、user は必ず null。

---

## v0で実装しないもの

* DM機能
* 通報機能
* 管理画面
* 学生メール認証
* 決済機能

---

## バージョン

* v0：掲示板の最小成立構成
* v1以降で機能拡張予定
