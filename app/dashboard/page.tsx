"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole, roleToDashboardPath, setAuthMessage } from "@/helpers/auth.helper";

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        const role = getRole();
        if (!role) {
            setAuthMessage("No se encontro un rol valido para la sesion.");
            router.replace("/auth/login");
            return;
        }
        router.replace(roleToDashboardPath(role));
    }, [router]);

    return null;
}