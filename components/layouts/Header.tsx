"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { clearAuthSession, getToken, setAuthMessage } from "@/helpers/auth.helper";

export default function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsAuthenticated(!!getToken());
    }, [pathname]);

    const showLogout = isAuthenticated && !pathname.startsWith("/auth");

    function handleLogout() {
        clearAuthSession();
        setAuthMessage("Has cerrado sesión correctamente.");
        window.location.replace("/auth/login");
    }

    return (
        <header className="w-full px-8 py-6 flex justify-between items-center">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
                Ledger
            </div>
            <div className="flex items-center gap-6">
                <span className="hidden md:block text-sm font-medium text-on-surface-variant">
                    Transparencia y Trazabilidad
                </span>
                {showLogout ? (
                    <button
                        id="btn-logout"
                        type="button"
                        onClick={handleLogout}
                        aria-label="Cerrar sesión"
                        className="flex items-center gap-1.5 text-sm font-semibold text-tertiary hover:text-tertiary-dim transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                            logout
                        </span>
                        Cerrar sesión
                    </button>
                ) : null}
            </div>
        </header>
    );
}
