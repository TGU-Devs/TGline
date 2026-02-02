import { GraduationCap } from 'lucide-react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4'>
        <div className='text-center mb-8'>
            <div className='bg-sky-600 text-white w-12 h-12 flex items-center justify-center mx-auto mb-4 shadouw-lg rounded-2xl'>
                <GraduationCap size={28} />
            </div>
            <h1 className='text-2xl font-bold'>TGU掲示板</h1>
            <p className='text-sm text-gray-500 mt-2'>東北学院大学 学内共通プラットフォーム</p>
        </div>

        <main className='w-full max-w-md'>
            {children}
        </main>

        <div className='mt-8 text-center text-xs text-gray-400'>
            利用規約とプライバシーポリシーをご確認の上、ご利用ください。
        </div>
    </div>
  );
}