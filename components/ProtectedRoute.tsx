"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "./layouts/Loader";
import { getRole, getToken, roleToDashboardPath, UserRole } from "@/helpers/auth.helper";

type ProtectedRouteProps = {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = getToken();

        if (!token) {
            router.replace("/auth/login");
            return;
        }

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