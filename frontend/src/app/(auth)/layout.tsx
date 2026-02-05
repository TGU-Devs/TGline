import { GraduationCap } from 'lucide-react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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