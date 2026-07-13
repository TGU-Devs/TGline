import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

const GET = async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) => {
    try {
        const params = await context.params;
        const cookie = request.headers.get("cookie") || "";

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/users/${params.id}`,
            {
                method: "GET",
                headers: {
                    Cookie: cookie,
                },
            },
        );

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: "ユーザー情報の取得に失敗しました" },
                { status: backendResponse.status },
            );
        }

        const data = await backendResponse.json();
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("ユーザー情報の取得中にエラーが発生:", error);
        return NextResponse.json(
            { error: "ユーザー情報の取得中にエラーが発生しました" },
            { status: 500 },
        );
    }
}

export { GET };
