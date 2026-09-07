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

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### トークンの有効期限

* アクセストークン: 7日（1週間）
* リフレッシュトークン: v0では実装しない

**注意**: v0ではリフレッシュトークンがないため、7日経過後は再ログインが必要。

トークンが期限切れの場合：

```json
{
  "error": "token_expired"
}
```

ステータスコード: 401 Unauthorized

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
```

---

## 認証・ユーザー（Authentication & Users）

### POST /users/sign_up

#### 概要

新規ユーザー登録（サインアップ）を行う。  
成功時、JWTトークンを返す。

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
    "description": null,
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Signed up successfully"
}
```

**重要**: フロントエンドは`token`を保存し（localStorage等）、以降のAPIリクエストで使用する。

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
成功時、JWTトークンを返す。

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
    "description": null,
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Signed in successfully"
}
```

**重要**: フロントエンドは`token`を保存し（cookie等）、以降のAPIリクエストで使用する。

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
JWTの場合は、クライアント側でトークンを削除する。  
（v0ではサーバー側でのトークン無効化は実装しない）

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### レスポンス

成功時：204 No Content

**注意**: JWTはステートレスなため、サーバー側での無効化は難しい。  
v0では、クライアント側でトークンを削除するだけで十分。

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

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### レスポンス

成功時（200 OK）：

```json
{
  "id": 1,
  "email": "user@example.com",
  "display_name": "太郎",
  "description": "経済学部3年です。就活中です。",
  "role": "user",
  "created_at": "2026-01-01T12:00:00Z",
  "avatar": {
    "url": "http://localhost:3001/rails/active_storage/blobs/.../icon.png",
    "content_type": "image/png",
    "byte_size": 12345
  },
  "notify_email": true,
  "notify_email_like": true,
  "notify_email_comment": true
}
```

※ `avatar` 未設定時は `null`  
※ `notify_email` / `notify_email_like` / `notify_email_comment` はメール通知設定（DB デフォルトはいずれも `true`）

エラー時（401 Unauthorized）：

```json
{
  "error": "unauthorized"
}
```

---

### PATCH /users/me

#### 概要

現在ログインしているユーザーのプロフィールを更新する。  
テキスト更新は JSON、アバター画像のアップロードは `multipart/form-data` で送る。

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### リクエストボディ

テキスト更新（JSON）：

```json
{
  "user": {
    "display_name": "新しい名前",
    "description": "自己紹介文",
    "notify_email": true,
    "notify_email_like": true,
    "notify_email_comment": false
  }
}
```

アバター更新（multipart/form-data）：

* `user[avatar]`：画像ファイル（アップロード / 差し替え）
* `user[remove_avatar]`：`true` でアバター削除
* `user[display_name]` / `user[description]`：同時更新可
* `user[notify_email]` / `user[notify_email_like]` / `user[notify_email_comment]`：メール通知設定（boolean）

#### バリデーション

* display_name：任意（更新する場合のみ）
* description：任意（最大200文字）
* avatar：JPEG / PNG / WebP / GIF、2MB以下
* notify_email：任意（boolean）。`false` のときいいね／コメントのメールは送らない
* notify_email_like：任意（boolean）。いいねのメールを送るか
* notify_email_comment：任意（boolean）。コメントのメールを送るか

#### レスポンス

成功時：

```json
{
  "id": 1,
  "email": "user@example.com",
  "display_name": "新しい名前",
  "description": "自己紹介文",
  "role": "user",
  "created_at": "2026-01-01T12:00:00Z",
  "avatar": {
    "url": "http://localhost:3001/rails/active_storage/blobs/.../icon.png",
    "content_type": "image/png",
    "byte_size": 12345
  },
  "notify_email": true,
  "notify_email_like": true,
  "notify_email_comment": false
}
```

※ `avatar` 未設定時は `null`  
※ `notify_email` が `false` のときは、`notify_email_like` / `notify_email_comment` が `true` でもメールは送らない

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

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### レスポンス

成功時（200 OK）：

```json
{
  "id": 2,
  "display_name": "花子",
  "description": "法学部2年です。",
  "created_at": "2026-01-01T12:00:00Z",
  "avatar": {
    "url": "http://localhost:3001/rails/active_storage/blobs/.../icon.png",
    "content_type": "image/png",
    "byte_size": 12345
  }
}
```

※ emailは公開情報に含めない  
※ `avatar` 未設定時は `null`

エラー時（401 Unauthorized）：

```json
{
  "error": "unauthorized"
}
```

エラー時（404 Not Found - ユーザーが存在しない、または削除済み）：

```json
{
  "errors": ["User not found"]
}
```

---

## 投稿（Posts）

### GET /posts

#### 概要

投稿一覧を取得する。  
論理削除された投稿は含めない。

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### クエリ（任意）

* category: Tagのcategory enum（faculty / class / topic）
* tag_id: タグID

#### レスポンス例

```json
{
  "posts": [
    {
      "id": 1,
      "title": "経済学のレポートについて",
      "body": "〇〇先生の授業について質問です",
      "tags": [
        {
          "id": 3,
          "name": "ミクロ経済学",
          "category": "class"
        }
      ],
      "likes_count": 5,
      "current_user_liked": false,
      "comments_count": 2,
      "images": [],
      "user": {
        "id": 2,
        "display_name": "太郎",
        "avatar": {
          "url": "http://localhost:3001/rails/active_storage/blobs/.../icon.png",
          "content_type": "image/png",
          "byte_size": 12345
        }
      },
      "created_at": "2026-01-01T12:00:00Z",
      "updated_at": "2026-01-01T12:00:00Z"
    }
  ],
  "has_next": false
}
```

※ `user.avatar` 未設定時は `null`  
※ 投稿者が削除済みの場合、`user` は `null`

---

### POST /posts

#### 概要

投稿を作成する。

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### リクエストボディ

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

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### レスポンス

GET /posts と同形式。

---

### DELETE /posts/:id

#### 概要

自分の投稿を論理削除する。

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

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
投稿者以外のいいねでは、投稿者向けのアプリ内通知を作成する（自分の投稿へのいいねでは作成しない）。通知作成後、投稿者のメール設定に応じてメールを送信する。

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

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

いいねを解除する。関連する通知も削除する。

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

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

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

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
投稿者以外のコメントでは、投稿者向けのアプリ内通知を作成する（自分の投稿へのコメントでは作成しない）。通知作成後、投稿者のメール設定に応じてメールを送信する。

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### リクエストボディ

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
  "user": {
    "id": 2,
    "display_name": "太郎",
    "avatar": {
      "url": "http://localhost:3001/rails/active_storage/blobs/.../icon.png",
      "content_type": "image/png",
      "byte_size": 12345
    }
  },
  "created_at": "2026-01-01T12:10:00Z"
}
```

※ `user.avatar` 未設定時は `null`

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

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### レスポンス

```json
[
  {
    "id": 1,
    "body": "わかる",
    "user": {
      "id": 2,
      "display_name": "太郎",
      "avatar": {
        "url": "http://localhost:3001/rails/active_storage/blobs/.../icon.png",
        "content_type": "image/png",
        "byte_size": 12345
      }
    },
    "created_at": "2026-01-01T12:10:00Z"
  },
  {
    "id": 2,
    "body": "私も同じです",
    "user": {
      "id": 3,
      "display_name": "花子",
      "avatar": null
    },
    "created_at": "2026-01-01T12:15:00Z"
  }
]
```

※ `user.avatar` 未設定時は `null`  
※ コメント投稿者が削除済みの場合、`user` は `null`

---

## 通知（Notifications）

いいね・コメントにより投稿者へアプリ内通知を作成する。メール送信は受信者の設定（`notify_email` / `notify_email_like` / `notify_email_comment`）に従う。メール送信に失敗してもアプリ内通知は残る。いいね取り消し・コメント削除時は対応する通知も削除する。

※ お知らせ通知・リアルタイム配信・デスクトップ通知は対象外

### GET /notifications

#### 概要

自分宛の通知を新しい順に取得する。1ページあたり20件。

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### クエリ（任意）

* page: ページ番号（省略時は 1）

#### レスポンス

成功時（200 OK）：

```json
{
  "notifications": [
    {
      "id": 1,
      "kind": "like",
      "read": false,
      "message": "太郎があなたの投稿「ミクロ経済学の課題」にいいねしました",
      "actor": {
        "id": 2,
        "display_name": "太郎",
        "avatar": {
          "url": "http://localhost:3001/rails/active_storage/blobs/.../icon.png",
          "content_type": "image/png",
          "byte_size": 12345
        }
      },
      "post_id": 10,
      "created_at": "2026-01-01T12:10:00Z"
    },
    {
      "id": 2,
      "kind": "comment",
      "read": true,
      "message": "花子があなたの投稿「ミクロ経済学の課題」にコメントしました",
      "actor": {
        "id": 3,
        "display_name": "花子",
        "avatar": null
      },
      "post_id": 10,
      "created_at": "2026-01-01T12:05:00Z"
    }
  ],
  "has_next_page": false
}
```

※ `kind` は `like` または `comment`  
※ `actor.avatar` 未設定時は `null`

---

### GET /notifications/unread_count

#### 概要

自分宛の未読通知の総数を取得する。

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### レスポンス

成功時（200 OK）：

```json
{
  "count": 3
}
```

---

### POST /notifications/:id/read

#### 概要

指定した通知を既読にする。自分宛の通知のみ対象。

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### レスポンス

成功時（200 OK）：該当通知オブジェクト（`read` が `true`）

通知が見つからない場合（404 Not Found）：

```json
{
  "error": "Notification not found"
}
```

---

### POST /notifications/read_all

#### 概要

自分宛の未読通知をすべて既読にする。

#### リクエストヘッダー

```
Authorization: Bearer <token>
```

#### レスポンス

成功時：204 No Content

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
