import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/relay-cookies";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function DELETE(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";

    await fetch(`${BACKEND_URL}/api/users/sign_out`, {
      method: "DELETE",
      headers: {
        Cookie: cookie,
      },
    });

    const response = new NextResponse(null, { status: 204 });
    clearAuthCookie(response);

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
