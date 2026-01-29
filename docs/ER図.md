# TGU掲示板 ER定義（v0）

## users

- id (PK)
- display_name
- role
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

## リレーションまとめ

- users has many posts
- users has many comments
- users has many likes

- posts belongs to user
- posts has many comments
- posts has many likes
- posts has many tags through post_tags

- comments belongs to user
- comments belongs to post

- likes belongs to user
- likes belongs to post

- tags has many posts through post_tags

- post_tags belongs to post
- post_tags belongs to tag
