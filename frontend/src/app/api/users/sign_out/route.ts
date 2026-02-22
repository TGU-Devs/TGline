import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function DELETE(request: NextRequest) {
  try {
    // リクエストからcookieを取得
    const cookie = request.headers.get("cookie") || "";

    // バックエンドにリクエスト
    const backendRes = await fetch(`${BACKEND_URL}/api/users/sign_out`, {
      method: "DELETE",
      headers: {
        Cookie: cookie,
      },
    });

    // レスポンスを作成（204 No Contentの場合はbodyなし）
    const response = new NextResponse(null, { status: backendRes.status });

    // バックエンドからのSet-Cookieヘッダーを取得してブラウザに設定（cookie削除用）
    // ドメイン属性を除去してフロントエンドのドメインでCookieが設定されるようにする
    const setCookieHeader = backendRes.headers.get("set-cookie");
    if (setCookieHeader) {
      const cleanedCookie = setCookieHeader.replace(/;\s*domain=[^;]*/gi, "");
      response.headers.set("Set-Cookie", cleanedCookie);
    }

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
