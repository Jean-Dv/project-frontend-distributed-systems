"use client";

import { useState } from "react";
import Link from "next/link";
import InputField from "@/components/ui/InputField";
import { useRouter } from "next/navigation";
import nextConfig from "@/next.config";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: implementar autenticación
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const remember = formData.get("remember") === "on";

        setIsLoading(true);
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
                toast.success("Inicio de sesión exitoso");
                router.push("/dashboard");
            }
            else {
                throw new Error("Credenciales inválidas o error en el servidor");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al iniciar sesión");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
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
            <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
            >
                <span className="flex items-center gap-2">
                    Iniciar Sesión
                    <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
                        arrow_forward
                    </span>
                </span>
            </Button>
        </form>
    );
}