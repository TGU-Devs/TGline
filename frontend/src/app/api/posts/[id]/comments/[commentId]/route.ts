import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const cookie = request.headers.get("cookie") || "";

    const backendRes = await fetch(
      `${BACKEND_URL}/api/posts/${id}/comments/${commentId}`,
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
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
