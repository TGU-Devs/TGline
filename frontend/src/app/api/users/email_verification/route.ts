import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/relay-cookies";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/users/email_verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Email verification request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/users/email_verification`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (backendRes.ok && data.token) {
      const token = data.token;
      delete data.token;
      const response = NextResponse.json(data, { status: backendRes.status });
      setAuthCookie(token, response);
      return response;
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Email verification execute error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
