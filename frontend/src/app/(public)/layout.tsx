"use client";

import { usePathname } from "next/navigation";
import { UserProvider, useUser } from "@/contexts/UserContext";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/sidebar/MobileNav";
import Logo from "@/components/layout/sidebar/Logo";
import { useEffect, useState } from "react"; 
import Header from "@/components/layout/sidebar/Header";

type AuthState = "loading" | "authenticated" | "unauthenticated";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <LayoutContent>{children}</LayoutContent>
    </UserProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const { user: currentUser, isLoading } = useUser();

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

  return <PublicLayoutContent pathname={pathname}>{children}</PublicLayoutContent>;
}

function PublicLayoutContent({
  pathname,
  children,
}: {
  pathname: string;
  children: React.ReactNode;
}) {
  const { user: currentUser, isLoading } = useUser();

  // ローディング中
  if (isLoading) {
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
  if (currentUser) {
    return (
      <UserProvider>
        <div className="flex flex-col min-h-screen bg-white">
          <Header currentUser={currentUser} isLoading={isLoading} />
          <div className="flex flex-1 bg-white">
            <Sidebar />
            <main className="flex-1 p-0 overflow-y-auto bg-white [&>*]:mt-0 [&>*]:pt-0">
              <div className="pt-6">
                {children}
              </div>
            </main>
          </div>

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
