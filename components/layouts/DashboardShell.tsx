"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getRole } from "@/helpers/auth.helper";

interface NavItem {
    href: string;
    icon: string;
    label: string;
}

const NAV_ITEMS: NavItem[] = [
    { href: "/dashboard/contracts", icon: "description", label: "Contratos" },
    { href: "/dashboard/suppliers", icon: "business_center", label: "Proveedores" },
    { href: "/dashboard/audit", icon: "analytics", label: "Auditoría" },
];

const ROLE_LABELS: Record<string, string> = {
    FUNC: "FUNCIONARIO",
    ADMIN: "ADMINISTRADOR",
    AUDITOR: "AUDITOR",
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [roleLabel, setRoleLabel] = useState<string>("");

    useEffect(() => {
        const role = getRole();
        setRoleLabel(role ? (ROLE_LABELS[role] ?? role) : "");
    }, []);

    return (
        <div className="flex flex-1">
            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r border-outline-variant/30 bg-surface-container-lowest sticky top-0 self-start h-screen overflow-y-auto">
                {/* Brand / role block */}
                <div className="px-6 py-5 flex items-center gap-3 border-b border-outline-variant/30">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="material-symbols-outlined text-on-primary text-[20px]">gavel</span>
                    </div>
                    <div className="min-w-0">
                        {roleLabel && (
                            <p className="text-label-caps text-on-surface-variant">Rol: {roleLabel}</p>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-1 p-3 mt-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-body-sm ${
                                    isActive
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                                }`}
                            >
                                <span
                                    className="material-symbols-outlined text-[22px]"
                                    style={
                                        isActive ? { fontVariationSettings: "'FILL' 1" } : {}
                                    }
                                >
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer hint */}
                <div className="p-4 border-t border-outline-variant/30">
                    <div className="flex items-center gap-2 text-label-caps text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        Entorno seguro
                    </div>
                </div>
            </aside>

            {/* ── Main content ─────────────────────────────────────────────── */}
            <main className="flex-1 min-w-0 overflow-auto">
                {children}
            </main>
        </div>
    );
}
