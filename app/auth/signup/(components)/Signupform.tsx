"use client";

import { useState } from "react";
import InputField from "@/components/ui/InputField";
import nextConfig from "@/next.config";
import { useRouter } from "next/navigation";

export default function SignupForm() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: implementar autenticación
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
            }
            else {
                throw new Error("Error al registrarse");
            }
        } catch (error) {
            console.error(error);
        }

        console.log(username, password);
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