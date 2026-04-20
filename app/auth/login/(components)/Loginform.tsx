"use client";

import { useState } from "react";
import Link from "next/link";
import InputField from "@/components/ui/InputField";
import { useRouter } from "next/navigation";
import nextConfig from "@/next.config";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: implementar autenticación
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
                const { token } = await response.json();
                sessionStorage.setItem("access_token", token);
                router.push("/dashboard");
            }
            else {
                throw new Error("Error al iniciar sesión");
            }
        } catch (error) {
            console.error(error);
        }

        console.log(username, password, remember);
    }

    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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