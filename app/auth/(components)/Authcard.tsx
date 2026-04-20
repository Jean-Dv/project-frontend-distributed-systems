import Link from "next/link";
import OAuthbuttons from "./OAuthbuttons";
import LoginForm from "../login/(components)/Loginform";
import SignupForm from "../signup/(components)/Signupform";

export default function AuthCard({ variant }: { variant: "login" | "signup" }) {
    return (
        <div className="w-full max-w-110 bg-surface-container-lowest rounded-xl shadow-[0_32px_64px_-12px_rgba(42,52,57,0.06)] p-10 flex flex-col gap-8 border border-outline-variant/10">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-on-surface tracking-tight leading-tight">
                    Acceso a Ledger
                </h1>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                    {variant === "login"
                        ? "Inicia sesión para acceder a tus registros arquitectónicos legales."
                        : "Regístrate para acceder a tus registros arquitectónicos legales."}
                </p>
            </div>

            {/* Form */}
            {variant === "login" ? <LoginForm /> : <SignupForm />}

            {/* Enterprise SSO */}
            <OAuthbuttons />

            {/* Register link */}
            <div className="text-center pt-2">
                <p className="text-sm text-on-surface-variant">
                    {variant === "login"
                        ? "¿Eres nuevo en Ledger?"
                        : "¿Ya tienes una cuenta?"}
                    <Link
                        href={variant === "login" ? "/auth/signup" : "/auth/login"}
                        className="text-tertiary font-semibold hover:underline decoration-2 underline-offset-4"
                    >
                        &nbsp;
                        {variant === "login"
                            ? "Solicitar Acceso"
                            : "Iniciar Sesión"}
                    </Link>
                </p>
            </div>
        </div>
    );
}