"use client";

import { useState } from "react";
import InputField from "@/components/ui/InputField";
import nextConfig from "@/next.config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

export default function SignupForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: implementar autenticación
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        setIsLoading(true);
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
                toast.success("Registro completado con éxito. Por favor inicia sesión.");
                router.push("/auth/login");
            }
            else {
                throw new Error("Error al registrarse");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al registrarse");
            console.error(error);
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

            {/* Password */}
            <InputField
                id="password"
                label="Contraseña"
                icon="lock"
                type="password"
                placeholder="••••••••••••"
                autoComplete="current-password"
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