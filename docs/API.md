# TGU掲示板 API仕様（v0）

## 前提

- バックエンド：Rails 7（APIモード）
- 認証：Devise＋JWT
- 全APIはログイン必須
- 削除はすべて論理削除
- 管理者機能・DM機能は v0 では実装しない

---
### 認証方式

JWT（JSON Web Token）を使用したトークンベース認証。

#### 認証フロー

1. **サインアップ/ログイン**: `POST /users/sign_up` または `POST /users/sign_in` でJWTトークンを取得
2. **APIリクエスト**: 取得したトークンを `Authorization` ヘッダーに含めてリクエスト
3. **トークン形式**: `Authorization: Bearer <token>`

#### 認証ヘッダーの例

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
```

---

## 認証・ユーザー（Authentication & Users）

### POST /users/sign_up

#### 概要

新規ユーザー登録（サインアップ）を行う。

#### リクエスト

```json
{
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "display_name": "太郎"
}
```

#### バリデーション

* email：必須、有効なメールアドレス形式、一意
* password：必須、最小6文字
* password_confirmation：必須、passwordと一致
* display_name：必須

#### レスポンス

成功時（201 Created）：

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "太郎",
    "role": "user"
  },
  "message": "Signed up successfully"
}
```

エラー時：

```json
{
  "errors": {
    "email": ["has already been taken"],
    "password": ["is too short (minimum is 6 characters)"],
    "display_name": ["can't be blank"]
  }
}
```

---

### POST /users/sign_in

#### 概要

ログインを行う。

#### リクエスト

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### レスポンス

成功時（200 OK）：

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "太郎",
    "role": "user"
  },
  "message": "Signed in successfully"
}
```

エラー時（401 Unauthorized）：

```json
{
  "error": "Invalid Email or password"
}
```

---

### DELETE /users/sign_out

#### 概要

ログアウトを行う。

#### レスポンス

成功時：204 No Content

エラー時：

```json
{
  "error": "unauthorized"
}
```

---

### GET /users/me

#### 概要

現在ログインしているユーザーの情報を取得する。

#### レスポンス

```json
{
  "id": 1,
  "email": "user@example.com",
  "display_name": "太郎",
  "role": "user",
  "created_at": "2026-01-01T12:00:00Z"
}
```

エラー時（未ログイン）：

```json
{
  "error": "unauthorized"
}
```

---

### PATCH /users/me

#### 概要

現在ログインしているユーザーのプロフィールを更新する。

#### リクエスト

```json
{
  "display_name": "新しい名前"
}
```

#### バリデーション

* display_name：任意（更新する場合のみ）

#### レスポンス

成功時：

```json
{
  "id": 1,
  "email": "user@example.com",
  "display_name": "新しい名前",
  "role": "user",
  "created_at": "2026-01-01T12:00:00Z"
}
```

エラー時：

```json
{
  "errors": {
    "display_name": ["can't be blank"]
  }
}
```

---

### GET /users/:id

#### 概要

指定されたユーザーの公開情報を取得する。

#### レスポンス

```json
{
  "id": 2,
  "display_name": "花子",
  "created_at": "2026-01-01T12:00:00Z"
}
```

※ emailは公開情報に含めない

エラー時（ユーザーが存在しない、または削除済み）：

```json
{
  "errors": ["User not found"]
}
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
