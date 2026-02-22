import { NextResponse } from "next/server";

/**
 * バックエンドから受け取ったJWTトークンをCookieとして設定する
 * Node.js fetchではSet-Cookieヘッダーが取得できないため、
 * レスポンスボディのtokenからCookieを直接設定する
 */
export function setAuthCookie(token: string, response: NextResponse) {
  const isProduction = process.env.NODE_ENV === "production";
  const maxAge = 7 * 24 * 60 * 60; // 7日間

  response.headers.append(
    "Set-Cookie",
    `jwt_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isProduction ? "; Secure" : ""}`
  );
}

/**
 * JWTトークンを削除するCookieを設定する（ログアウト用）
 */
export function clearAuthCookie(response: NextResponse) {
  const isProduction = process.env.NODE_ENV === "production";

  response.headers.append(
    "Set-Cookie",
    `jwt_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProduction ? "; Secure" : ""}`
  );
}
