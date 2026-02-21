import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const cookie = request.headers.get("cookie") || "";

    const backendRes = await fetch(
      `${BACKEND_URL}/api/posts/${params.id}/comments/${params.commentId}`,
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

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
