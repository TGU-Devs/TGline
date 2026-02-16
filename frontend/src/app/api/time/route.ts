import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function GET() {
  try {
    // バックエンドにリクエスト
    const backendRes = await fetch(`${BACKEND_URL}/api/time`, {
      method: "GET",
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Get time error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
