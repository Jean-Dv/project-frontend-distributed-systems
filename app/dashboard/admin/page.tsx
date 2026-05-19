import Link from "next/link";

export default function AdminDashboardPage() {
    return (
        <main className="px-8 py-10 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-bold text-on-surface">Panel de Administracion</h1>
                <p className="text-on-surface-variant text-sm">
                    Accesos rapidos a proveedores y auditoria.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Link
                    href="/dashboard/suppliers"
                    className="group rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-on-surface">Proveedores</h2>
                        <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                            arrow_forward
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-on-surface-variant">
                        Gestiona y revisa el estado de proveedores.
                    </p>
                </Link>

                <Link
                    href="/dashboard/audit"
                    className="group rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-on-surface">Auditoria</h2>
                        <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                            arrow_forward
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-on-surface-variant">
                        Consulta eventos y trazabilidad del sistema.
                    </p>
                </Link>
            </div>
        </main>
    );
}
