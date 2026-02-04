export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>
      <div className="grid gap-4">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">ようこそ！</h2>
          <p className="text-muted-foreground">
            認証が必要なページです。ここに投稿一覧やプロフィールなどを表示します。
          </p>
        </div>
      </div>
    </div>
  )
}
