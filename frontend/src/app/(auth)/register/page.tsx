import { Suspense } from "react";
import AuthForm from "@/components/features/auth/AuthForm";

const Register = () => {
    return (
        <Suspense>
            <AuthForm isRegister={true} />
        </Suspense>
    )
};

export default Register;
