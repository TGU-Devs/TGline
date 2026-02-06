import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type User = {
    id: string;
    username: string;
    email: string;
    password: string;
    createdAt: string;
};

type Errors = {
    email?: string;
    password?: string;
    main?: string;
};

const dbPath = path.join(process.cwd(), "src", "mock", "users.json");

const validateLoginInput = (email: string, password: string) => {
    const errors: Errors = {};
    const emailRegex =
        /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

    if (!email || email.trim().length === 0) {
        errors.email = "メールアドレスを入力してください";
    } else if (!emailRegex.test(email)) {
        errors.email = "正しいメールアドレスを入力してください";
    }

    if (!password || password.length < 6) {
        errors.password = "6文字以上のパスワードを入力してください";
    }

    return errors;
};

export const POST = async (request: NextRequest) => {
    try {
        const { email, password } = await request.json();

        const errors = validateLoginInput(email, password);
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ errors: errors }, { status: 400 });
        }

        let users: User[] = [];
        if (fs.existsSync(dbPath)) {
            const fileContent = fs.readFileSync(dbPath, "utf-8");
            users = JSON.parse(fileContent);
        }

        const user = users.find(
            (u) => u.email === email && u.password === password,
        );

        if (!user) {
            return NextResponse.json(
                {
                    errors: {
                        main: "メールアドレスまたはパスワードが正しくありません",
                    },
                },
                { status: 401 },
            );
        }

        return NextResponse.json(
            {
                message: "ログインに成功しました",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
                token: "mock-token-" + user.id,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { errors: { main: "サーバーエラーが発生しました" } },
            { status: 500 },
        );
    }
};
