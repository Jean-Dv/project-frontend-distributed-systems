"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "./layouts/Loader";
import { getToken, setAuthMessage } from "@/helpers/auth.helper";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = getToken();

        if (!token) {
            setAuthMessage("Debes iniciar sesion para continuar.");
            router.replace("/auth/login");
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) return <Loader />;

    return <>{children}</>;
}