"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpen, LogIn, MessageSquare } from "lucide-react";

const PUBLIC_NAV_ITEMS = [
  { href: "/posts", label: "投稿", icon: MessageSquare },
  { href: "/courses", label: "授業評価", icon: BookOpen },
] as const;

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border bg-background/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Image
            src="/TGline-nobg2.png"
            alt="TGline"
            width={140}
            height={45}
            className="h-auto w-28 object-contain sm:w-36"
          />
        </Link>

        <nav aria-label="公開ページ" className="flex items-center gap-1">
          {PUBLIC_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-3 sm:text-sm ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="size-4" />
                <span className="hidden min-[360px]:inline">{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/login"
            aria-label="ログイン"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-4 sm:text-sm"
          >
            <LogIn className="size-4" />
            <span className="hidden min-[360px]:inline">ログイン</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
