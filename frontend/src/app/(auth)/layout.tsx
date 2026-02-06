"use client";

import { GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          router.push('/posts');
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, [router]);
      
  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未ログインの場合は認証ページを表示
  if (!isAuthenticated) {

    return (
      <div className='min-h-screen flex flex-col items-center justify-center p-4 bg-sky-50'>
        <div className='text-center mb-8'>
            <div className='bg-sky-600 text-white w-14 h-14 flex items-center justify-center mx-auto mb-4 shadow-lg rounded-2xl'>
                <GraduationCap size={31} />
            </div>
            <h1 className='text-3xl font-bold text-slate-800'>TG line</h1>
            <p className='text-sm text-slate-500 mt-2'>東北学院大学 学内共通プラットフォーム</p>
        </div>

        <main className='w-full max-w-md'>
            {children}
        </main>

        <div className='mt-8 text-center text-xs text-slate-400'>
            利用規約とプライバシーポリシーをご確認の上、ご利用ください。
        </div>
    </div>
  );
  }
}