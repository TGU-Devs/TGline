# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# ダミーユーザーデータを作成
puts "Creating dummy users..."

# 既存のユーザーを削除（開発環境のみ）
if Rails.env.development?
  User.destroy_all
  puts "Cleared existing users"
end

# ダミーユーザーを作成(開発環境のみ)
if Rails.env.development?
  users_data = [
    {
      email: "tanaka@tgu.ac.jp",
      password: "password123",
      display_name: "田中太郎",
      description: "自己紹介",
      role: "user"
    },
    {
      email: "suzuki@tgu.ac.jp",
      password: "password123",
      display_name: "鈴木花子",
      role: "user"
    },
    {
      email: "yamada@tgu.ac.jp",
      password: "password123",
      display_name: "山田次郎",
      role: "user"
    },
    {
      email: "admin@tgu.ac.jp",
      password: "admin123",
      display_name: "管理者",
      role: "admin"
    },
    {
      email: "sato@tgu.ac.jp",
      password: "password123",
      display_name: "佐藤三郎",
      role: "user"
    }
  ]

  users_data.each do |user_data|
    user = User.find_or_create_by!(email: user_data[:email]) do |u|
      u.password = user_data[:password]
      u.display_name = user_data[:display_name]
      u.role = user_data[:role]
    end
    puts "Created/Updated user: #{user.display_name} (#{user.email})"
  end

  puts "Created #{User.count} users!"

  puts "Creating dummy posts..."

  posts_data = [
    {
      title: "投稿1",
      body: "これは投稿1の内容です",
      user: User.first,
    },
    { title: "投稿2",
      body: "これは投稿2の内容です",
      user: User.second

    },
    { title: "投稿3",
      body: "これは投稿3の内容です",
      user: User.third,
      deleted_at: Time.current
    },
    { title: "投稿4",
      body: "これは投稿4の内容です",
      user: User.fourth,
    }
  ]

  posts_data.each do |post_data|
    post = Post.find_or_create_by!(title: post_data[:title]) do |p|
      p.body = post_data[:body]
      p.user = post_data[:user]
    end
    puts "Created/Updated post: #{post.title} (#{post.user.display_name})"
  end

  puts "Created #{Post.count} posts!"
end

# タグのマスターデータ投入（全環境共通・冪等）
puts "Creating tags..."
Tag::DEFINITIONS.each do |category, names|
  names.each do |name|
    Tag.find_or_create_by!(name: name, category: category)
  end
end
puts "Tags: #{Tag.count}"

# 開発用: ダミー投稿にタグを紐付け
if Rails.env.development?
  puts "Assigning tags to posts..."

  economics_tag = Tag.find_by(name: "経済学部")
  job_hunting_tag = Tag.find_by(name: "就活")
  course_advice_tag = Tag.find_by(name: "履修相談")

  Post.all.each_with_index do |post, i|
    case i
    when 0
      post.tags << economics_tag unless post.tags.include?(economics_tag)
      post.tags << course_advice_tag unless post.tags.include?(course_advice_tag)
    when 3
      post.tags << job_hunting_tag unless post.tags.include?(job_hunting_tag)
    end
  end

  puts "Assigned tags to posts!"
end