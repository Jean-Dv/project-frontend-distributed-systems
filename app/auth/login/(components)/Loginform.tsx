"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InputField from "@/components/ui/InputField";
import { useRouter } from "next/navigation";
import nextConfig from "@/next.config";
import { getRole, popAuthMessage, roleToDashboardPath, setAuthSession } from "@/helpers/auth.helper";
import { getErrorMessage } from "@/helpers/use-api.helper";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const message = popAuthMessage();
        if (message) {
            setErrorMessage(message);
        }
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage(null);
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const remember = formData.get("remember") === "on";

        try {
            const response = await fetch(`${nextConfig.env!.API_BASE_URL}/ms-auth/auth/login`, {
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
                const data = await response.json();
                const token = data?.token as string;
                if (!token) {
                    setErrorMessage("No fue posible iniciar sesion. Intenta de nuevo.");
                    return;
                }
                const scopes = Array.isArray(data?.scopes) ? data.scopes : undefined;
                const role = typeof data?.role === "string" ? data.role : null;
                setAuthSession({ token, scopes, role });
                router.push(roleToDashboardPath(getRole()));
            } else {
                const message = await getErrorMessage(response);
                setErrorMessage(message || "Credenciales invalidas o usuario inactivo");
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("No fue posible iniciar sesion. Intenta de nuevo.");
        }
        void remember;
    }

    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {errorMessage ? (
                <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                    {errorMessage}
                </div>
            ) : null}
            {/* Email */}
            <InputField
                id="username"
                label="Nombre de Usuario"
                icon="person"
                type="text"
                placeholder="@"
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
                headerRight={
                    <Link
                        href="#"
                        className="text-xs font-medium text-tertiary hover:text-tertiary-dim transition-colors"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                }
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

            {/* Remember me */}
            <div className="flex items-center gap-3 py-1">
                <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="w-4 h-4 text-primary bg-surface-container-low border-outline-variant/30 rounded focus:ring-primary/50 focus:ring-offset-0"
                />
                <label
                    htmlFor="remember"
                    className="text-sm text-on-surface-variant cursor-pointer select-none"
                >
                    Recordar este dispositivo por 30 días
                </label>
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="w-full bg-linear-to-r from-primary to-primary-dim text-on-primary font-semibold py-4 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
            >
                <span>Iniciar Sesión</span>
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                    arrow_forward
                </span>
            </button>
        </form>
    );
}