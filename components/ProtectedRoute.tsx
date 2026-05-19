"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "./layouts/Loader";
import {
    clearAuthSession,
    getRole,
    getToken,
    isTokenExpired,
    roleToDashboardPath,
    setAuthMessage,
    UserRole,
} from "@/helpers/auth.helper";
import { useTokenExpiryWatcher } from "@/hooks/useTokenExpiryWatcher";

type ProtectedRouteProps = {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    // DP-90: Automatically redirect when the JWT expires mid-session.
    useTokenExpiryWatcher();

    useEffect(() => {
        const token = getToken();

        // No token at all → redirect to login.
        if (!token) {
            router.replace("/auth/login");
            return;
        }

        // DP-90: Token present but expired → clear session and notify user.
        if (isTokenExpired(token)) {
            clearAuthSession();
            setAuthMessage("Tu sesión expiró. Por favor, inicia sesión de nuevo.");
            router.replace("/auth/login");
            return;
        }

        // Role-based access control.
        if (allowedRoles && allowedRoles.length > 0) {
            const role = getRole();
            if (!role || !allowedRoles.includes(role)) {
                router.replace(roleToDashboardPath(role));
                return;
            }
        }

        if (!authorized) {
            setAuthorized(true);
        }
    }, [allowedRoles, authorized, router]);

    if (!authorized) return <Loader />;

    return <>{children}</>;
}