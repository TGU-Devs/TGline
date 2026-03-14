"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserProvider } from "@/contexts/UserContext";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/sidebar/MobileNav";
import Logo from "@/components/layout/sidebar/Logo";

type AuthState = "loading" | "authenticated" | "unauthenticated";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    // ランディングページでは認証チェック不要
    if (pathname === "/") {
      setAuthState("unauthenticated");
      return;
    }
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => {
        setAuthState(res.ok ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        setAuthState("unauthenticated");
      });
  }, [pathname]);

  // ランディングページ（/）は独自レイアウトを持つのでそのまま表示
  if (pathname === "/") {
    return <>{children}</>;
  }

  // ローディング中
  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証済み: Sidebar 付きレイアウト（private layout と同じ見た目）
  if (authState === "authenticated") {
    return (
      <UserProvider>
        <div className="lg:flex">
          <Sidebar />
          <main className="pt-16 min-h-screen lg:min-h-0 lg:flex-1 lg:pb-0">
            {children}
          </main>
        </div>
      </UserProvider>
    );
  }

  // 未認証:
  // - PC: ロゴのみの固定ヘッダー（MobileNav と同じスタイル）
  // - スマホ: MobileNav ヘッダー（currentUser=null でハンバーガー非表示）
  return (
    <>
      {/* PC: ロゴのみの固定ヘッダー */}
      <header className="hidden lg:flex fixed inset-x-0 top-0 z-40 h-16 items-center border-b border-sidebar-border bg-sidebar px-6 shadow-sm">
        <Logo isDesktop={false} href="/" />
      </header>
      {/* スマホ: MobileNav ヘッダー（currentUser=null でハンバーガー非表示） */}
      <MobileNav
        currentUser={null}
        isLoading={false}
        menuList={[]}
        pathname={pathname}
      />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </>
  );
}
