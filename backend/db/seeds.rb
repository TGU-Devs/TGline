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

# ダミーユーザーを作成
users_data = [
  {
    email: "tanaka@tgu.ac.jp",
    password: "password123",
    display_name: "田中太郎",
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
