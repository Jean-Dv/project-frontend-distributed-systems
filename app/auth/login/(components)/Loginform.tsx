"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InputField from "@/components/ui/InputField";
import { useRouter } from "next/navigation";
import { clearAuthSession, getRole, popAuthMessage, roleToDashboardPath, setAuthSession } from "@/helpers/auth.helper";
import { getApiBaseUrl } from "@/helpers/use-api.helper";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // DP-90: message set by the system when session expires or explicit logout.
    const [authMessage, setAuthMessageState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const message = popAuthMessage();
        if (message) {
            setAuthMessageState(message);
        }
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage(null);
        // TODO: implementar autenticación
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const remember = formData.get("remember") === "on";

        setIsLoading(true);
        try {
            const response = await fetch(`${getApiBaseUrl()}/ms-auth/auth/login`, {
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
                const userRole = getRole();
                if (!userRole) {
                    clearAuthSession();
                    toast.error("Tu cuenta no tiene un rol asignado. Espera a que un administrador te asigne permisos para acceder.");
                    setIsLoading(false);
                    return;
                }
                router.push(roleToDashboardPath(userRole));
            } else if (response.status >= 500) {
                setErrorMessage(
                    "El servicio no está disponible en este momento. Intenta nuevamente más tarde.",
                );
                setIsLoading(false);
            } else {
                const errorBody = await response.json().catch(() => null);
                const rawMessage =
                    typeof errorBody?.message === "string" ? errorBody.message : undefined;
                const altMessage =
                    typeof errorBody?.error === "string" ? errorBody.error : undefined;
                const candidate = rawMessage || altMessage;
                const message =
                    !candidate || candidate === "Unauthorized"
                        ? "Credenciales inválidas o usuario inactivo."
                        : candidate;
                setErrorMessage(message);
                setIsLoading(false);
            }
        } catch {
            toast.error("No se pudo conectar con el servicio.");
            setErrorMessage("No fue posible iniciar sesion. Intenta de nuevo.");
            setIsLoading(false);
        }
    }

    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* DP-90: System auth message (session expired / logout confirmation) */}
            {authMessage ? (
                <Alert
                    variant={authMessage.toLowerCase().includes("correctamente") ? "success" : "info"}
                >
                    {authMessage}
                </Alert>
            ) : null}
            {/* Login error message */}
            {errorMessage ? (
                <Alert variant="error">
                    {errorMessage}
                </Alert>
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