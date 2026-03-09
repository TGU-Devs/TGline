import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${BACKEND_URL}/api/admin/stats`, {
      method: "GET",
      headers: {
        Cookie: cookie,
      },
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
