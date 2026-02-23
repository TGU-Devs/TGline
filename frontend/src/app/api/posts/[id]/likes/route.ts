import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookie = request.headers.get("cookie") || "";

    const backendRes = await fetch(
      `${BACKEND_URL}/api/posts/${params.id}/likes`,
      {
        method: "POST",
        headers: {
          Cookie: cookie,
        },
      }
    );

    if (backendRes.status === 201) {
      return new NextResponse(null, { status: 201 });
    }

    const text = await backendRes.text();
    if (!text) {
      return new NextResponse(null, { status: backendRes.status });
    }
    return NextResponse.json(JSON.parse(text), { status: backendRes.status });
  } catch (error) {
    console.error("Like post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookie = request.headers.get("cookie") || "";

    const backendRes = await fetch(
      `${BACKEND_URL}/api/posts/${params.id}/likes`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookie,
        },
      }
    );

    if (backendRes.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const text = await backendRes.text();
    if (!text) {
      return new NextResponse(null, { status: backendRes.status });
    }
    return NextResponse.json(JSON.parse(text), { status: backendRes.status });
  } catch (error) {
    console.error("Unlike post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
