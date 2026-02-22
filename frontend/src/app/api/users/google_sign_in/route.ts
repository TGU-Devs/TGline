import { NextRequest, NextResponse } from "next/server";
import { relayCookies } from "@/lib/relay-cookies";

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

    relayCookies(backendRes, response);

    return response;
  } catch (error) {
    console.error("Google sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
