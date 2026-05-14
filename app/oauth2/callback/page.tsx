"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/layouts/Loader";
import { getRole, roleToDashboardPath, setAuthMessage, setAuthSession } from "@/helpers/auth.helper";

export default function OAuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const token = params.get("token");
        const scopesRaw = params.get("scopes");

        if (!token) {
            setAuthMessage("Error en la autenticación con Google. Intenta de nuevo.");
            router.replace("/auth/login");
            return;
        }

        const scopes = scopesRaw
            ? decodeURIComponent(scopesRaw).split(",").filter(Boolean)
            : [];

        setAuthSession({ token, scopes });

        const role = getRole();
        if (!role) {
            setAuthMessage(
                "Inicio de sesión exitoso, pero tu cuenta no tiene permisos asignados. Contacta a un administrador."
            );
            router.replace("/auth/login");
            return;
        }

        router.replace(roleToDashboardPath(role));
    }, [router]);

    return <Loader />;
}
