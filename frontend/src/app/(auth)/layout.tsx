"use client";

import Image from 'next/image';
//Google の認証に必要な設定（Client ID）を子コンポーネントに共有するReact の Context Provider
import { GoogleOAuthProvider } from '@react-oauth/google';


export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='relative min-h-screen flex flex-col items-center justify-center p-4 bg-background overflow-hidden'>
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-primary/10 blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className='text-center mb-8 animate-fade-in'>
          <div className='w-18 h-18 flex items-center justify-center mx-auto mb-4 shadow-lg rounded-2xl overflow-hidden bg-white'>
              <Image src="/TGlinelogo.svg" alt="TGline" width={64} height={64} className="w-full h-full mix-blend-multiply" />
          </div>
          <p className='text-sm text-muted-foreground mt-2'>東北学院大学生のための情報共有アプリ</p>
      </div>

      <main className='w-full max-w-md animate-slide-up'>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
              {children}
          </GoogleOAuthProvider>
      </main>

    </div>
  );
}
