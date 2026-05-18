"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDashboardNavItems, UserRole } from "@/helpers/auth.helper";

type DashboardSidebarProps = {
    role: UserRole | null;
};

export default function DashboardSidebar({ role }: DashboardSidebarProps) {
    const pathname = usePathname();
    const items = getDashboardNavItems(role);

    return (
        <aside className="w-full md:w-64 bg-surface-container-low border-r border-outline-variant/20 p-6">
            <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-tertiary">Dashboard</p>
                <h2 className="text-lg font-semibold text-on-surface">Panel de control</h2>
            </div>
            <nav className="flex flex-col gap-2">
                {items.map((item) => {
                    const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
