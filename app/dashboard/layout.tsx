"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardSidebar from "./(components)/DashboardSidebar";
import {
    clearAuthSession,
    getRole,
    isDashboardRouteAllowed,
    roleToDashboardPath,
    setAuthMessage,
} from "@/helpers/auth.helper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const role = getRole();

    useEffect(() => {
        if (!role) {
            setAuthMessage("No fue posible determinar tu rol. Inicia sesion nuevamente.");
            clearAuthSession();
            router.replace("/auth/login");
            return;
        }

        if (!isDashboardRouteAllowed(role, pathname)) {
            router.replace(roleToDashboardPath(role));
        }
    }, [pathname, role, router]);

    return (
        <ProtectedRoute>
            <div className="min-h-[calc(100vh-72px)] bg-surface flex flex-col md:flex-row">
                <DashboardSidebar role={role} />
                <main className="flex-1 p-6">{children}</main>
            </div>
        </ProtectedRoute>
    );
}