'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // 認証状態をチェック
    fetch('/api/users/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          router.push('/login')
        }
      })
      .catch(() => {
        setIsAuthenticated(false)
        router.push('/login')
      })
  }, [router])

  // ローディング中
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 未認証の場合はリダイレクト（何も表示しない）
  if (!isAuthenticated) {
    return null
  }

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>
}
