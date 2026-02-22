import { NextRequest, NextResponse } from "next/server";
import { relayCookies } from "@/lib/relay-cookies";

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

    relayCookies(backendRes, response);

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
