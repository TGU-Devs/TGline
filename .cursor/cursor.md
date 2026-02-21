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
- Deviseを使用（メール/パスワード認証）
- Google OAuth によるソーシャルログインに対応
- 誰でもサインアップ・ログイン可能
- 学生メール制限は行わない（v0）
- 全ページ閲覧にはログイン必須

### 認証フロー
- Browser → Next.js API routes (BFF proxy) → Rails backend
- Rails が `jwt_token` httpOnly cookie を発行
- ブラウザは Rails に直接アクセスしない

### Google OAuth（クライアントサイド Google Sign-In 方式）

**方式**: クライアントサイド SSO（OmniAuth 不使用）

```
[ブラウザ] → Google Sign-In SDK で ID トークン取得
     ↓
[Next.js API route] → ID トークンを Rails に転送
     ↓
[Rails] → Google に ID トークンを検証 → ユーザー検索/作成 → jwt_token cookie 発行
```

**クライアントサイド SSO を選択した理由**:
- BFF アーキテクチャ上、ブラウザが Rails に直接アクセスしない設計のため、サーバーサイド OAuth（OmniAuth）のリダイレクトフローが複雑になる
- クライアントサイド方式なら既存の BFF proxy パターンにそのまま乗せられる
- 今回は「ログイン認証のみ」が目的で、Google API（Gmail, Drive 等）へのサーバーサイドアクセスは不要

**サーバーサイド OAuth フローが適切なケース（参考）**:
- Rails がフロントも兼ねている場合（Rails MVC / OmniAuth が自然にハマる）
- Google API にサーバーからアクセスしたい場合（アクセストークン/リフレッシュトークンが必要）
- 認証だけでなく認可（権限取得）が必要な場合

**アカウント連携ポリシー**:
- 同じメールアドレスの既存ユーザー（メール/パスワード登録）がいる場合、自動連携はせずエラーを返す（アカウント乗っ取り防止）
- Google OAuth ユーザーはパスワードなしで新規作成される
逆に言うと、最初に Google で登録した人はずっとGoogle                                        ログイン、メール/パスワードで登録した人はずっとメール/パスワードという形になります。 

### User（論理設計）
- 認証関連カラムはDevise管理（仕様書には含めない）
- OAuth用に provider / uid カラムを追加
- アプリ独自属性のみ管理

User
id (PK)

display_name

role (user / admin)

provider (OAuth プロバイダー名。Google の場合 'google'、メール/パスワードの場合 NULL)

uid (OAuth プロバイダー上のユーザーID。メール/パスワードの場合 NULL)

deleted_at


---

## 投稿（Post）

### 仕様
- ログインユーザーのみ投稿可能
- 投稿者は自分の投稿を削除可能
- 削除は論理削除
- 管理者UIはv0では作らない（DB操作で対応）

### Post

Post

id (PK)

user_id (FK -> users.id)
title
body


created_at

deleted_at


---

## コメント（Comment）

### 仕様
- フラット構造（返信機能なし）
- 削除は論理削除
- 編集不可

### Comment

Comment

id (PK)

post_id (FK -> posts.id)

user_id (FK -> users.id)

body

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
