"use client";

import { useState } from "react";
import InputField from "@/components/ui/InputField";
import { getApiBaseUrl } from "@/helpers/use-api.helper";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

export default function SignupForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    function isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!email || !isValidEmail(email)) {
            toast.error("Ingrese un correo electrónico válido.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }

        if (!password || password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${getApiBaseUrl()}/ms-auth/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password }),
            });
            if (response.ok) {
                toast.success("Registro completado con éxito. Por favor inicia sesión.");
                router.push("/auth/login");
            } else {
                const errorBody = await response.json().catch(() => null);
                const message = errorBody?.message || "Error al registrarse";
                toast.error(message);
            }
        } catch {
            toast.error("Error de conexión con el servidor.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
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

            {/* Email */}
            <InputField
                id="email"
                label="Correo electrónico"
                icon="mail"
                type="email"
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
            />

            {/* Password */}
            <InputField
                id="password"
                label="Contraseña"
                icon="lock"
                type="password"
                placeholder="••••••••••••"
                autoComplete="new-password"
                required
            />

            {/* Confirm password */}
            <InputField
                id="confirmPassword"
                label="Confirmar contraseña"
                icon="lock"
                type="password"
                placeholder="••••••••••••"
                autoComplete="new-password"
                required
            />

            {/* Submit */}
            <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
            >
                <span className="flex items-center gap-2">
                    Registrarse
                    <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
                        arrow_forward
                    </span>
                </span>
            </Button>
        </form>
    );
}