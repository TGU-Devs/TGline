import AuthForm from "@/components/features/auth/AuthForm";
import Link from "next/link";

const Login = () => {
    return (
        <div className="flex flex-col items-center gap-4">
            <AuthForm isRegister={false} />
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
