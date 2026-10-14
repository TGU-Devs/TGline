# TGU掲示板 ER定義（v0）

## users

- id (PK)
- display_name
- description (nullable)
- role
- notify_email (boolean, default true, NOT NULL)
- notify_email_like (boolean, default true, NOT NULL)
- notify_email_comment (boolean, default true, NOT NULL)
- deleted_at

※ Devise を使用するため、実際のテーブルには以下も含まれる
- email
- encrypted_password
- reset_password_token
- reset_password_sent_at
- remember_created_at
- created_at
- updated_at

---

## posts

- id (PK)
- user_id (FK -> users.id)
- title
- body
- is_anonymous
- created_at
- deleted_at

---

## comments

- id (PK)
- post_id (FK -> posts.id)
- user_id (FK -> users.id)
- body
- is_anonymous
- created_at
- deleted_at

---

## likes

- id (PK)
- user_id (FK -> users.id)
- post_id (FK -> posts.id)

制約:
- UNIQUE(user_id, post_id)

---

## tags

- id (PK)
- name (nullable)  # 自由タグ用のカラム
- category (enum, NOT NULL)  # faculty / class / topic

※ category は enum（faculty: 学部・学科 / class: 授業名 / topic: 就活・サークルなど）

---

## post_tags

- id (PK)
- post_id (FK -> posts.id)
- tag_id (FK -> tags.id)

制約:
- UNIQUE(post_id, tag_id)

---

## notifications

- id (PK)
- recipient_id (FK -> users.id, NOT NULL)  # 通知を受け取るユーザー
- actor_id (FK -> users.id, NOT NULL)      # いいね／コメントしたユーザー
- notifiable_type (string, NOT NULL)       # Like / Comment
- notifiable_id (bigint, NOT NULL)
- kind (integer, NOT NULL)                 # enum: like=0 / comment=1
- read_at (datetime, nullable)             # 未読時は null
- created_at
- updated_at

制約:
- UNIQUE(notifiable_type, notifiable_id, recipient_id)

※ 自分の投稿へのいいね／コメントでは行を作らない  
※ いいね取り消し・コメント削除時は対応する通知も削除する

---

## リレーションまとめ

- users has many posts
- users has many comments
- users has many likes
- users has many notifications (as recipient)
- users has many notifications (as actor)

- posts belongs to user
- posts has many comments
- posts has many likes
- posts has many tags through post_tags

- comments belongs to user
- comments belongs to post

- likes belongs to user
- likes belongs to post

- notifications belongs to recipient (users)
- notifications belongs to actor (users)
- notifications belongs to notifiable (polymorphic: Like or Comment)

- tags has many posts through post_tags

- post_tags belongs to post
- post_tags belongs to tag
