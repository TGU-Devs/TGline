import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バックエンドにGoogle IDトークンを転送
    const backendRes = await fetch(`${BACKEND_URL}/api/users/google_sign_in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    // レスポンスを作成
    const response = NextResponse.json(data, { status: backendRes.status });

    // バックエンドからのSet-Cookieヘッダーをブラウザにリレー
    // ドメイン属性を除去してフロントエンドのドメインでCookieが設定されるようにする
    const setCookieHeader = backendRes.headers.get("set-cookie");
    if (setCookieHeader) {
      const cleanedCookie = setCookieHeader.replace(/;\s*domain=[^;]*/gi, "");
      response.headers.set("Set-Cookie", cleanedCookie);
    }

    return response;
  } catch (error) {
    console.error("Google sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
