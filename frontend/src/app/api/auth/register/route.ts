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
    username?: string;
    email?: string;
    password?: string;
    main?: string;
}

const dbPath = path.join(process.cwd(), 'src', 'mock', 'users.json');

const validateRegisterInput = (username: string, email: string, password: string) => {
    const errors: Errors = {};
    const emailRegex = /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

    if (!username || username.trim().length === 0) {
        errors.username = 'ユーザーネームを入力してください';
    }

    if (!email || email.trim().length === 0) {
        errors.email = 'メールアドレスを入力してください';
    } else if (!emailRegex.test(email)) {
        errors.email = '正しいメールアドレスを入力してください';
    }

    if (!password || password.length < 6) {
        errors.password = '6文字以上のパスワードを入力してください';
    }

    return errors;
}

export  const POST = async (request: NextRequest) => {
    try {
        const { username, email, password } = await request.json();

        const errors = validateRegisterInput(username, email, password);
        if (Object.keys(errors).length > 0) {
            return NextResponse.json(
                { errors: errors},
                { status: 400 }
            );
        }

        let users: User[] = [];
        if (fs.existsSync(dbPath)) {
            const fileContent = fs.readFileSync(dbPath, 'utf-8');
            users = JSON.parse(fileContent);
        }

        if (users.find(user => user.email === email)) {
            return NextResponse.json(
                { errors: { email: 'このメールアドレスは既に登録されています' } },
                { status: 400 }
            );
        }

        const newUser: User = {
            id: String(Date.now()),
            username: username.trim(),
            email: email.trim(),
            password: password,
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);

        fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

        return NextResponse.json(
            {
                message: 'ユーザー登録が成功しました',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { errors: { main: '登録に失敗しました' } },
            { status: 500 }
        );
    }
}