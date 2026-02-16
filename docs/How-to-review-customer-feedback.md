# フィードバック確認・管理ガイド

このドキュメントでは、ユーザーから送信されたフィードバック（お問い合わせ）を確認・管理する方法を説明します。

現在、管理画面は実装されていないため、**Railsコンソール**を使用してフィードバックを確認・管理します。

---

## 目次

1. [Railsコンソールへの接続](#railsコンソールへの接続)
2. [フィードバックの一覧確認](#フィードバックの一覧確認)
3. [フィードバックの詳細確認](#フィードバックの詳細確認)
4. [ステータスの更新](#ステータスの更新)
5. [統計情報の確認](#統計情報の確認)
6. [CSVエクスポート](#csvエクスポート)
7. [便利なコマンド集](#便利なコマンド集)

---

## Railsコンソールへの接続

### 1. コンソールを起動

```bash
docker compose exec backend bundle exec rails console
```

### 2. コンソールの終了

```ruby
exit
```

または `Ctrl + D`

---

## フィードバックの一覧確認

### 全フィードバックを確認（最新20件）

```ruby
Feedback.active.order(created_at: :desc).limit(20)
```

### 未対応のフィードバックのみ確認

```ruby
Feedback.pending.order(created_at: :desc)
```

### カテゴリー別に確認

**バグ報告のみ**
```ruby
Feedback.by_category("bug").order(created_at: :desc)
```

**機能要望のみ**
```ruby
Feedback.by_category("feature_request").order(created_at: :desc)
```

**質問のみ**
```ruby
Feedback.by_category("question").order(created_at: :desc)
```

**その他**
```ruby
Feedback.by_category("other").order(created_at: :desc)
```

### ステータス別に確認

**未対応（pending）**
```ruby
Feedback.by_status("pending").order(created_at: :desc)
```

**確認済み（reviewed）**
```ruby
Feedback.by_status("reviewed").order(created_at: :desc)
```

**対応完了（resolved）**
```ruby
Feedback.by_status("resolved").order(created_at: :desc)
```

**クローズ（closed）**
```ruby
Feedback.by_status("closed").order(created_at: :desc)
```

### 見やすく表示する

```ruby
Feedback.active.order(created_at: :desc).limit(10).each do |f|
  puts "=" * 50
  puts "ID: #{f.id}"
  puts "カテゴリー: #{f.category}"
  puts "件名: #{f.subject}"
  puts "ステータス: #{f.status}"
  puts "送信者: #{f.user.display_name}"
  puts "送信日時: #{f.created_at.strftime('%Y-%m-%d %H:%M')}"
  puts "=" * 50
end
```

---

## フィードバックの詳細確認

### ID指定で取得

```ruby
feedback = Feedback.find(1)
```

### 全属性を表示

```ruby
feedback.attributes
```

### 送信者情報を確認

```ruby
# 表示名
feedback.user.display_name

# メールアドレス
feedback.user.email

# ユーザーID
feedback.user.id
```

### 内容を読みやすく表示

```ruby
puts "=" * 60
puts "フィードバック詳細 [ID: #{feedback.id}]"
puts "=" * 60
puts "カテゴリー: #{feedback.category}"
puts "件名: #{feedback.subject}"
puts "ステータス: #{feedback.status}"
puts "-" * 60
puts "本文:"
puts feedback.body
puts "-" * 60
puts "送信者: #{feedback.user.display_name} (#{feedback.user.email})"
puts "送信日時: #{feedback.created_at.strftime('%Y年%m月%d日 %H:%M')}"
puts "=" * 60
```

### 管理者メモを確認

```ruby
feedback.admin_notes
```

### 確認日時と確認者

```ruby
# 確認日時
feedback.reviewed_at

# 確認した管理者
if feedback.reviewed_by
  reviewer = User.find(feedback.reviewed_by)
  puts "確認者: #{reviewer.display_name}"
end
```

---

## ステータスの更新

### 確認済みにする

```ruby
feedback = Feedback.find(1)

feedback.update(
  status: "reviewed",
  admin_notes: "確認しました。次回アップデートで対応予定です。",
  reviewed_at: Time.current,
  reviewed_by: User.find_by(role: "admin").id
)
```

### 対応完了にする

```ruby
feedback = Feedback.find(1)

feedback.update(
  status: "resolved",
  admin_notes: "v1.2で修正しました。ご報告ありがとうございました。"
)
```

### クローズする

```ruby
feedback = Feedback.find(1)

feedback.update(
  status: "closed",
  admin_notes: "重複報告のためクローズしました。"
)
```

### 複数のフィードバックを一括更新

```ruby
# 古い未対応フィードバックをクローズ
old_feedbacks = Feedback.pending.where("created_at < ?", 3.months.ago)
old_feedbacks.update_all(
  status: "closed",
  admin_notes: "期限切れのためクローズ"
)
```

---

## 統計情報の確認

### 総数を確認

```ruby
# アクティブなフィードバックの総数
Feedback.active.count

# すべてのフィードバック（削除済み含む）
Feedback.count
```

### ステータス別の集計

```ruby
Feedback.active.group(:status).count
```

**出力例:**
```
{"pending"=>15, "reviewed"=>8, "resolved"=>12, "closed"=>5}
```

### カテゴリー別の集計

```ruby
Feedback.active.group(:category).count
```

**出力例:**
```
{"bug"=>20, "feature_request"=>10, "question"=>8, "other"=>2}
```

### 期間別の集計

**今月の件数**
```ruby
Feedback.where("created_at >= ?", Time.current.beginning_of_month).count
```

**今週の件数**
```ruby
Feedback.where("created_at >= ?", Time.current.beginning_of_week).count
```

**今日の件数**
```ruby
Feedback.where("created_at >= ?", Time.current.beginning_of_day).count
```

**先月の件数**
```ruby
Feedback.where(created_at: 1.month.ago.beginning_of_month..1.month.ago.end_of_month).count
```

### ユーザー別の集計

**最もフィードバックを送信しているユーザー**
```ruby
Feedback.active.group(:user_id).count.sort_by { |_k, v| -v }.first(10).each do |user_id, count|
  user = User.find(user_id)
  puts "#{user.display_name}: #{count}件"
end
```

### 詳細な統計レポート

```ruby
puts "=" * 60
puts "フィードバック統計レポート"
puts "=" * 60
puts "総数: #{Feedback.active.count}件"
puts ""
puts "【ステータス別】"
Feedback.active.group(:status).count.each do |status, count|
  puts "  #{status}: #{count}件"
end
puts ""
puts "【カテゴリー別】"
Feedback.active.group(:category).count.each do |category, count|
  puts "  #{category}: #{count}件"
end
puts ""
puts "【期間別】"
puts "  今日: #{Feedback.where('created_at >= ?', Time.current.beginning_of_day).count}件"
puts "  今週: #{Feedback.where('created_at >= ?', Time.current.beginning_of_week).count}件"
puts "  今月: #{Feedback.where('created_at >= ?', Time.current.beginning_of_month).count}件"
puts "=" * 60
```

---

## CSVエクスポート

### 基本的なエクスポート

```ruby
require 'csv'

CSV.open("feedbacks_#{Date.today}.csv", "w") do |csv|
  # ヘッダー行
  csv << ["ID", "カテゴリー", "件名", "本文", "ステータス", "送信者", "送信日時"]
  
  # データ行
  Feedback.active.order(created_at: :desc).each do |f|
    csv << [
      f.id,
      f.category,
      f.subject,
      f.body,
      f.status,
      f.user.display_name,
      f.created_at.strftime("%Y-%m-%d %H:%M")
    ]
  end
end

puts "エクスポート完了: feedbacks_#{Date.today}.csv"
```

### 詳細な情報を含むエクスポート

```ruby
require 'csv'

CSV.open("feedbacks_detailed_#{Date.today}.csv", "w") do |csv|
  # ヘッダー行
  csv << [
    "ID", "カテゴリー", "件名", "本文", "ステータス",
    "送信者名", "送信者メール", "管理者メモ",
    "確認日時", "送信日時"
  ]
  
  # データ行
  Feedback.active.order(created_at: :desc).each do |f|
    csv << [
      f.id,
      f.category,
      f.subject,
      f.body,
      f.status,
      f.user.display_name,
      f.user.email,
      f.admin_notes,
      f.reviewed_at&.strftime("%Y-%m-%d %H:%M"),
      f.created_at.strftime("%Y-%m-%d %H:%M")
    ]
  end
end

puts "詳細エクスポート完了: feedbacks_detailed_#{Date.today}.csv"
```

### 条件付きエクスポート（未対応のみ）

```ruby
require 'csv'

CSV.open("feedbacks_pending_#{Date.today}.csv", "w") do |csv|
  csv << ["ID", "カテゴリー", "件名", "本文", "送信者", "送信日時"]
  
  Feedback.pending.order(created_at: :desc).each do |f|
    csv << [
      f.id,
      f.category,
      f.subject,
      f.body,
      f.user.display_name,
      f.created_at.strftime("%Y-%m-%d %H:%M")
    ]
  end
end

puts "未対応フィードバックをエクスポート: feedbacks_pending_#{Date.today}.csv"
```

---

## 便利なコマンド集

### よく使うコマンドのショートカット

```ruby
# 最新5件を見やすく表示
def show_latest(limit = 5)
  Feedback.active.order(created_at: :desc).limit(limit).each do |f|
    puts "\n" + "=" * 60
    puts "[#{f.id}] #{f.category} | #{f.status}"
    puts "件名: #{f.subject}"
    puts "送信者: #{f.user.display_name}"
    puts "日時: #{f.created_at.strftime('%Y-%m-%d %H:%M')}"
  end
  puts "=" * 60
end

# 実行例
show_latest
show_latest(10)
```

### 未対応フィードバックの件数を確認

```ruby
pending_count = Feedback.pending.count
puts "未対応のフィードバック: #{pending_count}件"
```

### 特定のユーザーのフィードバックを確認

```ruby
# ユーザーIDで検索
user = User.find(1)
user.feedbacks.order(created_at: :desc)

# メールアドレスで検索
user = User.find_by(email: "user@example.com")
user.feedbacks.order(created_at: :desc)
```

### キーワード検索

**件名で検索**
```ruby
Feedback.active.where("subject LIKE ?", "%バグ%").order(created_at: :desc)
```

**本文で検索**
```ruby
Feedback.active.where("body LIKE ?", "%ログイン%").order(created_at: :desc)
```

**件名または本文で検索**
```ruby
keyword = "エラー"
Feedback.active.where("subject LIKE ? OR body LIKE ?", "%#{keyword}%", "%#{keyword}%").order(created_at: :desc)
```

### 論理削除（ソフトデリート）

```ruby
feedback = Feedback.find(1)
feedback.soft_delete
```

### 論理削除されたフィードバックを確認

```ruby
Feedback.where.not(deleted_at: nil)
```

---

## カテゴリーとステータスの対応表

### カテゴリー（category）

| 値 | 日本語名 |
|---|---|
| `bug` | バグ報告 |
| `feature_request` | 機能要望 |
| `question` | 質問 |
| `other` | その他 |

### ステータス（status）

| 値 | 日本語名 | 説明 |
|---|---|---|
| `pending` | 未対応 | まだ確認していない |
| `reviewed` | 確認済み | 確認したが対応はまだ |
| `resolved` | 対応完了 | 対応が完了した |
| `closed` | クローズ | 対応不要または重複等でクローズ |

---

## トラブルシューティング

### フィードバックが見つからない場合

```ruby
# 削除済みも含めて検索
Feedback.find(1)

# 論理削除されているか確認
feedback = Feedback.unscoped.find(1)
feedback.deleted?
```

### コンソールで日本語が文字化けする場合

```ruby
# 文字エンコーディングを確認
Encoding.default_external

# UTF-8に設定
Encoding.default_external = Encoding::UTF_8
```

---

## 将来の管理画面について

現在コントローラーには、管理画面用のメソッド（`index`、`show`、`update`）がコメントアウトされた状態で準備されています。

将来、管理画面を実装する際は：

1. `app/controllers/api/feedbacks_controller.rb`のコメントアウト部分を有効化
2. `config/routes.rb`のルーティングを有効化
3. フロントエンドに管理画面UIを追加
4. `frontend/src/app/api/feedbacks/route.ts`のGETメソッドを有効化

これにより、WebブラウザからGUIでフィードバックを確認・管理できるようになります。

---

## 参考資料

- 設計書: `docs/customer-feedback-submission.md`
- Feedbackモデル: `backend/app/models/feedback.rb`
- Feedbacksコントローラー: `backend/app/controllers/api/feedbacks_controller.rb`
- ユーザー向けフォーム: `frontend/src/app/(private)/feedback/page.tsx`
