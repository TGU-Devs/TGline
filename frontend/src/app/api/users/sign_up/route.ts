import { NextRequest, NextResponse } from "next/server";
import { relayCookies } from "@/lib/relay-cookies";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バックエンドにリクエスト
    const backendRes = await fetch(`${BACKEND_URL}/api/users/sign_up`, {
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
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
