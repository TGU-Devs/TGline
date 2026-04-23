import { Suspense } from "react";
import AuthForm from "@/components/features/auth/AuthForm";
import Link from "next/link";

const Login = () => {
    return (
        <div className="flex flex-col items-center gap-4">
            <Suspense fallback={<div role="status" className="text-center text-sm text-muted-foreground">読み込み中...</div>}>
                <AuthForm isRegister={false} />
            </Suspense>
            <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
            >
                パスワードをお忘れですか？
            </Link>
        </div>
    )
}

export default Login;
