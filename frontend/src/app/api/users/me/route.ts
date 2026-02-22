import { NextRequest, NextResponse } from "next/server";
import { relayCookies } from "@/lib/relay-cookies";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function GET(request: NextRequest) {
  try {
    // リクエストからcookieを取得してバックエンドに転送
    const cookie = request.headers.get("cookie") || "";

    // バックエンドにリクエスト
    const backendRes = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: "GET",
      headers: {
        Cookie: cookie,
      },
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";

    // ボディがある場合は転送（通常ユーザーのパスワード検証用）
    let body: string | undefined;
    try {
      const json = await request.json();
      body = JSON.stringify(json);
    } catch {
      // OAuthユーザーはボディなし
    }

    const headers: Record<string, string> = {
      Cookie: cookie,
    };
    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: "DELETE",
      headers,
      body,
    });

    // 204の場合はbodyなし、エラーの場合はbodyあり
    if (backendRes.status === 204) {
      const response = new NextResponse(null, { status: 204 });

      relayCookies(backendRes, response);

      return response;
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const body = await request.json();

    // バックエンドにリクエスト
    const backendRes = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Update me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
