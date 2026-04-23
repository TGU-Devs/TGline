import { Suspense } from "react";
import AuthForm from "@/components/features/auth/AuthForm";

const Register = () => {
    return (
        <Suspense fallback={<div role="status" className="text-center text-sm text-muted-foreground">読み込み中...</div>}>
            <AuthForm isRegister={true} />
        </Suspense>
    )
};

export default Register;
