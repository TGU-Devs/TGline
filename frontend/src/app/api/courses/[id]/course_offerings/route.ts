import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get("cookie") || "";
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/courses/${id}/course_offerings`, {
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
    console.error("Create course offering error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
