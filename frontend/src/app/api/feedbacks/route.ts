import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookie = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${BACKEND_URL}/api/feedbacks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Create feedback error:", error);
    return NextResponse.json(
      { errors: ["送信に失敗しました"] },
      { status: 500 }
    );
  }
}

// 将来の管理画面用
// export async function GET(request: NextRequest) {
//   const cookie = request.headers.get("cookie") || "";
//   const { searchParams } = new URL(request.url);
//   const status = searchParams.get("status");
//   const category = searchParams.get("category");
//
//   const queryString = new URLSearchParams();
//   if (status) queryString.append("status", status);
//   if (category) queryString.append("category", category);
//
//   const backendRes = await fetch(
//     `${BACKEND_URL}/api/feedbacks?${queryString}`,
//     {
//       method: "GET",
//       headers: { Cookie: cookie },
//     }
//   );
//
//   const data = await backendRes.json();
//   return NextResponse.json(data, { status: backendRes.status });
// }
