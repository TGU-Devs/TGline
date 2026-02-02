# TGU掲示板 仕様書（v0 / Cursor用）

## 概要
東北学院大学向けの学内情報共有掲示板アプリ。  
Twitterライクな投稿を中心に、授業・学部・就活・サークル等の情報共有を目的とする。  
決済機能は持たず、教科書売買等はオフライン前提。(将来的に取り入れるv0ではなし)

---

## 技術スタック
- フロントエンド: Next.js 14（App Router）
- バックエンド: Ruby on Rails 7
- 認証: Devise
- インフラ: さくらVPS
- DB: PostgreSQL（想定）

---

## 認証・ユーザー
- Deviseを使用
- 誰でもサインアップ・ログイン可能
- 学生メール制限は行わない（v0）
- 全ページ閲覧にはログイン必須

### User（論理設計）
- 認証関連カラムはDevise管理（仕様書には含めない）
- アプリ独自属性のみ管理

User
id (PK)

display_name

role (user / admin)

deleted_at


---

## 投稿（Post）

### 仕様
- ログインユーザーのみ投稿可能
- 投稿者は自分の投稿を削除可能
- 削除は論理削除
- 匿名投稿が可能
- 管理者UIはv0では作らない（DB操作で対応）

### Post

Post

id (PK)

user_id (FK -> users.id)
title
body

is_anonymous (boolean)

created_at

deleted_at


---

## コメント（Comment）

### 仕様
- フラット構造（返信機能なし）
- 削除は論理削除
- 編集不可
- 匿名コメント可

### Comment

Comment

id (PK)

post_id (FK -> posts.id)

user_id (FK -> users.id)

body

is_anonymous (boolean)

created_at

deleted_at


---

## いいね（Like）

### 仕様
- 投稿に対してのみ付与可能
- 1ユーザー1投稿につき1いいねまで

### Like

Like

id (PK)

user_id (FK -> users.id)

post_id (FK -> posts.id)


制約:
- UNIQUE(user_id, post_id)

---

## タグ（Tag）

### 基本方針
- 完全自由入力はしない
- 用途ごとに category を固定(enum)
- 投稿にはタグがなくても良い

### Tag.category（enum）
- faculty: 学部・学科
- class: 授業名
- topic: 就活・サークルなど

### Tag

Tag

id (PK)

name (nullable)  # 自由タグ用のカラム（nullableでもOK）

category (enum, NOT NULL)  # faculty / class / topic


---

## 投稿とタグの関係（PostTag）

### 仕様
- Post と Tag は多対多
- 投稿にタグが0件でもOK
- category ごとの制約はアプリ側で制御

### PostTag

PostTag

id (PK)

post_id (FK -> posts.id)

tag_id (FK -> tags.id)


制約:
- UNIQUE(post_id, tag_id)

---

## タグ制約ルール（アプリ側）

- 投稿は **いずれか1つ以上の category を選択してもよい**
- 特定 category の必須指定はしない
- categoryごとの制約:
  - faculty: 1投稿につき最大1つ
  - topic: 複数可
  - class: 制限なし（v0）

---

## 削除ポリシー
- User / Post / Comment は論理削除
- FKの ON DELETE CASCADE は使用しない
- 削除済みデータは非表示とする

---

## 管理者
- User.role = admin
- v0では管理画面なし
- 問題投稿はDBから直接削除・論理削除で対応

---

## 未実装（v0では対象外）
- 通知機能
- DM機能
- 通報機能
- 学部・授業の完全マスタ同期
- 決済機能

---

## ERリレーション概要
- User 1 - * Post
- User 1 - * Comment
- Post 1 - * Comment
- User * - * Post (Like)
- Post * - * Tag (PostTag)

補足（Cursor向け注意）

UserモデルはDevise前提

category制約・faculty制限はモデル or サービス層で実装

DBは最小制約、ロジックはRails側で担保
