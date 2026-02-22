import { NextResponse } from "next/server";

/**
 * バックエンドのSet-Cookieヘッダーをフロントエンドのレスポンスにリレーする
 * ドメイン属性を除去してフロントエンドのドメインでCookieが設定されるようにする
 */
export function relayCookies(backendRes: Response, response: NextResponse) {
  const cookies = backendRes.headers.getSetCookie();
  console.log("[relayCookies] getSetCookie() count:", cookies.length);
  console.log("[relayCookies] getSetCookie() values:", cookies);
  console.log("[relayCookies] get('set-cookie'):", backendRes.headers.get("set-cookie"));
  for (const cookie of cookies) {
    const cleanedCookie = cookie.replace(/;\s*domain=[^;]*/gi, "");
    console.log("[relayCookies] appending:", cleanedCookie);
    response.headers.append("Set-Cookie", cleanedCookie);
  }
}
