import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";

    // クエリパラメーターを取得し、APIエンドポイントに渡す
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString
      ? `${BACKEND_URL}/api/posts?${queryString}`
      : `${BACKEND_URL}/api/posts`;

      // クエリパラメータがあれば、そのクエリパラメータをバックエンドに渡す
    const backendRes = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: cookie,
      },
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    const body = isMultipart ? await request.formData() : JSON.stringify(await request.json());

    // バックエンドにリクエスト
    const backendRes = await fetch(`${BACKEND_URL}/api/posts`, {
      method: "POST",
      headers: {
        ...(isMultipart ? {} : { "Content-Type": "application/json" }),
        Cookie: cookie,
      },
      body,
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
