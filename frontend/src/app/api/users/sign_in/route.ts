import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バックエンドにリクエスト
    const backendRes = await fetch(`${BACKEND_URL}/api/users/sign_in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    // レスポンスを作成
    const response = NextResponse.json(data, { status: backendRes.status });

    // バックエンドからのSet-Cookieヘッダーを取得してブラウザに設定
    const setCookieHeader = backendRes.headers.get("set-cookie");
    if (setCookieHeader) {
      response.headers.set("Set-Cookie", setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
