import { NextRequest, NextResponse } from "next/server";

// 認証不要（未ログインユーザー向け）のパス
const publicPaths = ["/", "/login", "/register", "/posts", "/forgot-password", "/reset-password"];

// middleware が適用されないパス
// API routes, _next, static files は除外
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("jwt_token");

  const isPublicPath = publicPaths.includes(pathname);

  // 認証済み + public/auth ページ → /posts にリダイレクト
  if (token && isPublicPath && pathname !== "/posts") {
    return NextResponse.redirect(new URL("/posts", request.url));
  }

  // 未認証 + private ページ → /login にリダイレクト
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
