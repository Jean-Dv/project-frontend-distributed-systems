"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { clearAuthSession, getRole, getToken, UserRole } from "@/helpers/auth.helper";

export default function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<UserRole | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        setIsAuthenticated(!!getToken());
        setRole(getRole());
    }, [pathname]);

    const showLogout = isAuthenticated && !pathname.startsWith("/auth");
    const navigationItems = useMemo(() => getNavigationItems(role), [role]);

    return (
        <header className="w-full px-8 py-6 flex justify-between items-center">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
                Ledger
            </div>
            <div className="flex items-center gap-6">
                {showLogout && navigationItems.length > 0 ? (
                    <nav className="hidden md:flex items-center gap-4">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                ) : null}
                <span className="hidden md:block text-sm font-medium text-on-surface-variant">
                    Transparencia y Trazabilidad
                </span>
                {showLogout ? (
                    <button
                        type="button"
                        onClick={() => {
                            clearAuthSession();
                            window.location.assign("/auth/login");
                        }}
                        className="text-sm font-semibold text-tertiary hover:text-tertiary-dim transition-colors"
                    >
                        Cerrar sesion
                    </button>
                ) : null}
            </div>
        </header>
    );
}

type NavigationItem = {
    label: string;
    href: string;
};

function getNavigationItems(role: UserRole | null): NavigationItem[] {
    if (role === "ADMIN") {
        return [
            { label: "Usuarios", href: "/dashboard/admin/users" },
            { label: "Proveedores", href: "/dashboard/suppliers" },
            { label: "Auditoria", href: "/dashboard/audit" },
        ];
    }

    if (role === "FUNC") {
        return [{ label: "Contratos", href: "/dashboard/contracts" }];
    }

    if (role === "AUDITOR") {
        return [{ label: "Auditoria", href: "/dashboard/audit" }];
    }

    return [];
}