"use client";

import { useState } from "react";
import InputField from "@/components/ui/InputField";
import nextConfig from "@/next.config";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/helpers/use-api.helper";

export default function SignupForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage(null);
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        try {
            const response = await fetch(`${nextConfig.env!.API_BASE_URL}/ms-auth/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password
                }),
            });
            if (response.ok) {
                router.push("/auth/login");
            } else {
                const message = await getErrorMessage(response);
                setErrorMessage(message || "No fue posible registrarse. Intenta de nuevo.");
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("No fue posible registrarse. Intenta de nuevo.");
        }

        void username;
        void password;
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMessage ? (
                <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                    {errorMessage}
                </div>
            ) : null}
            {/* Username */}
            <InputField
                id="username"
                label="Username"
                icon="person"
                type="text"
                placeholder="@nombre"
                autoComplete="username"
                required
            />

            {/* Password */}
            <InputField
                id="password"
                label="Contraseña"
                icon="lock"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                rightElement={
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-outline hover:text-on-surface transition-colors"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {showPassword ? "visibility_off" : "visibility"}
                        </span>
                    </button>
                }
            />

            {/* Submit */}
            <button
                type="submit"
                className="w-full bg-linear-to-r from-primary to-primary-dim text-on-primary font-semibold py-4 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
            >
                <span>Registrarse</span>
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                    arrow_forward
                </span>
            </button>
        </form>
    );
}