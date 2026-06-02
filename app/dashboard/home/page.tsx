"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRole, UserRole } from "@/helpers/auth.helper";
import { formatCurrency, formatDate } from "@/helpers/contracts.helper";
import type { ContractStatus } from "@/helpers/contracts.helper";
import { ContractStatusChip } from "@/components/contracts/ContractStatusChip";
import Loader from "@/components/layouts/Loader";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Supplier {
    id: string;
    name: string;
    nit?: string;
    isActive: boolean;
}

interface BackendAuditEvent {
    timestamp: string;
    serviceOrigin: string;
    action: string;
    data: Record<string, unknown>;
}

interface AsyncSectionState<T> {
    data: T;
    loading: boolean;
    error: string | null;
}

interface DashboardState {
    contracts: AsyncSectionState<ContractSummary[]>;
    suppliers: AsyncSectionState<Supplier[]>;
    auditEvents: AsyncSectionState<BackendAuditEvent[]>;
}

interface ContractSummary {
    id: string;
    contractNumber?: string;
    supplierName?: string;
    subject: string;
    status: ContractStatus;
    budget: number;
    startDate: string;
    endDate: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const FETCH_TIMEOUT_MS = 8000;

// ─── Helper: fetch with timeout ────────────────────────────────────────────

async function fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

function normalizeList<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && "content" in data) {
        return (data as { content: T[] }).content ?? [];
    }
    return [];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function HomeDashboardPage() {
    const [role, setRole] = useState<UserRole | null>(null);

    const [state, setState] = useState<DashboardState>({
        contracts: { data: [], loading: true, error: null },
        suppliers: { data: [], loading: true, error: null },
        auditEvents: { data: [], loading: true, error: null },
    });

    useEffect(() => {
        setRole(getRole());
    }, []);

    useEffect(() => {
        let cancelled = false;

        // ── Load contracts (with timeout) ───────────────────────────────────
        const loadContracts = async () => {
            try {
                const res = await fetchWithTimeout(
                    `${API_BASE}/ms-contracts/contracts`,
                    { headers: { Authorization: `Bearer ${getToken()}` } },
                    FETCH_TIMEOUT_MS
                );
                if (cancelled) return;
                if (!res.ok) throw new Error(`Error ${res.status}`);
                const data = await res.json();
                const items = normalizeList<ContractSummary>(data).slice(0, 5);
                setState((s) => ({ ...s, contracts: { data: items, loading: false, error: null } }));
            } catch {
                if (cancelled) return;
                setState((s) => ({ ...s, contracts: { data: [], loading: false, error: "No se pudieron cargar los contratos." } }));
            }
        };

        // ── Load suppliers (with timeout) ──────────────────────────────────
        const loadSuppliers = async () => {
            try {
                const res = await fetchWithTimeout(
                    `${API_BASE}/ms-suppliers/suppliers`,
                    { headers: { Authorization: `Bearer ${getToken()}` } },
                    FETCH_TIMEOUT_MS
                );
                if (cancelled) return;
                if (!res.ok) throw new Error(`Error ${res.status}`);
                const data = await res.json();
                const items = normalizeList<Supplier>(data).slice(0, 5);
                setState((s) => ({ ...s, suppliers: { data: items, loading: false, error: null } }));
            } catch {
                if (cancelled) return;
                setState((s) => ({ ...s, suppliers: { data: [], loading: false, error: "No se pudieron cargar los proveedores." } }));
            }
        };

        // ── Load audit events (with timeout) ────────────────────────────────
        const loadAudit = async () => {
            try {
                const res = await fetchWithTimeout(
                    `${API_BASE}/ms-audit/audit?from=0&size=5`,
                    { headers: { Authorization: `Bearer ${getToken()}` } },
                    FETCH_TIMEOUT_MS
                );
                if (cancelled) return;
                if (!res.ok) throw new Error(`Error ${res.status}`);
                const json = await res.json();
                const raw = Array.isArray(json) ? json : json.results || json.data || [];
                setState((s) => ({ ...s, auditEvents: { data: raw as BackendAuditEvent[], loading: false, error: null } }));
            } catch {
                if (cancelled) return;
                setState((s) => ({
                    ...s,
                    auditEvents: { data: [], loading: false, error: "No se pudieron cargar los eventos de auditoría." },
                }));
            }
        };

        // Run all in parallel (independent, partial loading)
        void loadContracts();
        void loadSuppliers();
        void loadAudit();

        return () => {
            cancelled = true;
        };
    }, []);

    // ── Render helpers ──────────────────────────────────────────────────────

    const renderRoleTitle = () => {
        switch (role) {
            case "ADMIN":
                return "Panel de Administración";
            case "FUNC":
                return "Panel de Funcionario";
            case "AUDITOR":
                return "Panel de Auditor";
            default:
                return "Dashboard";
        }
    };

    const renderRoleSubtitle = () => {
        switch (role) {
            case "ADMIN":
                return "Visión general de todos los módulos del sistema.";
            case "FUNC":
                return "Contratos y proveedores recientes. Accede rápido a tus acciones principales.";
            case "AUDITOR":
                return "Últimos eventos de auditoría registrados en la plataforma.";
            default:
                return "";
        }
    };

    // ── FUNC/OFFICER Dashboard ──────────────────────────────────────────────
    const renderOfficerDashboard = () => (
        <div className="space-y-8">
            {/* Recent Contracts */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-h2 text-primary">Contratos Recientes</h2>
                    <Link href="/dashboard/contracts" className="text-sm text-primary hover:underline flex items-center gap-1">
                        Ver todos <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                </div>
                {state.contracts.loading ? (
                    <div className="flex items-center justify-center py-10 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                        <Loader />
                    </div>
                ) : state.contracts.error ? (
                    <div className="bg-error-container/40 text-on-error p-4 rounded-xl text-center border border-error/20">
                        {state.contracts.error}
                    </div>
                ) : state.contracts.data.length === 0 ? (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 text-center text-on-surface-variant">
                        No hay contratos recientes.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {state.contracts.data.map((c) => (
                            <ContractCard key={c.id} contract={c} />
                        ))}
                    </div>
                )}
            </section>

            {/* Recent Suppliers + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-h2 text-primary">Proveedores Recientes</h2>
                        <Link href="/dashboard/suppliers" className="text-sm text-primary hover:underline flex items-center gap-1">
                            Ver todos <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                    </div>
                    {state.suppliers.loading ? (
                        <div className="flex items-center justify-center py-10 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                            <Loader />
                        </div>
                    ) : state.suppliers.error ? (
                        <div className="bg-error-container/40 text-on-error p-4 rounded-xl text-center border border-error/20">
                            {state.suppliers.error}
                        </div>
                    ) : state.suppliers.data.length === 0 ? (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 text-center text-on-surface-variant">
                            No hay proveedores recientes.
                        </div>
                    ) : (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
                            <ul className="divide-y divide-outline-variant/20">
                                {state.suppliers.data.map((s) => (
                                    <li key={s.id} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${s.isActive ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-variant text-on-surface-variant"}`}>
                                                <span className="material-symbols-outlined text-sm">{s.isActive ? "business" : "domain_disabled"}</span>
                                            </div>
                                            <div>
                                                <p className="text-table-data text-on-surface">{s.name}</p>
                                                {s.nit && <p className="text-body-sm text-on-surface-variant">NIT: {s.nit}</p>}
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${s.isActive ? "bg-secondary-container/20 text-secondary border-secondary/20" : "bg-error-container/40 text-error border-error/20"}`}>
                                            {s.isActive ? "HABILITADO" : "INHABILITADO"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {/* Quick Actions */}
                <section>
                    <h2 className="text-h2 text-primary mb-4">Acciones Rápidas</h2>
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 space-y-3">
                        <QuickActionCard href="/dashboard/contracts" icon="description" label="Ver Contratos" desc="Gestiona contratos activos" />
                        <QuickActionCard href="/dashboard/suppliers" icon="business_center" label="Ver Proveedores" desc="Consulta proveedores registrados" />
                        <QuickActionCard href="/dashboard/audit" icon="analytics" label="Auditoría" desc="Revisa el historial de eventos" />
                    </div>
                </section>
            </div>
        </div>
    );

    // ── AUDITOR Dashboard ───────────────────────────────────────────────────
    const renderAuditorDashboard = () => (
        <div className="space-y-8">
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-h2 text-primary">Últimos Eventos de Auditoría</h2>
                    <Link href="/dashboard/audit" className="text-sm text-primary hover:underline flex items-center gap-1">
                        Ver historial completo <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                </div>
                {state.auditEvents.loading ? (
                    <div className="flex items-center justify-center py-16 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                        <Loader />
                    </div>
                ) : state.auditEvents.error ? (
                    <div className="bg-error-container/40 text-on-error p-4 rounded-xl text-center border border-error/20">
                        {state.auditEvents.error}
                    </div>
                ) : state.auditEvents.data.length === 0 ? (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 text-center text-on-surface-variant">
                        No hay eventos de auditoría recientes.
                    </div>
                ) : (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
                        <AuditEventList events={state.auditEvents.data.slice(0, 5)} />
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-h2 text-primary mb-4">Acciones Rápidas</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <QuickActionCard href="/dashboard/audit" icon="search" label="Consultar Historial" desc="Filtra y busca eventos de auditoría" />
                    <QuickActionCard href="/dashboard/contracts" icon="description" label="Ver Contratos" desc="Revisa contratos para auditoría" />
                </div>
            </section>
        </div>
    );

    // ── ADMIN Dashboard ───────────────────────────────────────────────────────
    const renderAdminDashboard = () => (
        <div className="space-y-8">
            {/* Cards with counts / status */}
            <section>
                <h2 className="text-h2 text-primary mb-4">Resumen de Módulos</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <ModuleSummaryCard
                        title="Contratos"
                        icon="description"
                        loading={state.contracts.loading}
                        error={state.contracts.error}
                        count={state.contracts.data.length}
                        href="/dashboard/contracts"
                    />
                    <ModuleSummaryCard
                        title="Proveedores"
                        icon="business_center"
                        loading={state.suppliers.loading}
                        error={state.suppliers.error}
                        count={state.suppliers.data.length}
                        href="/dashboard/suppliers"
                    />
                    <ModuleSummaryCard
                        title="Auditoría"
                        icon="analytics"
                        loading={state.auditEvents.loading}
                        error={state.auditEvents.error}
                        count={state.auditEvents.data.length}
                        href="/dashboard/audit"
                    />
                </div>
            </section>

            {/* Latest events from each module */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-h2 text-primary">Contratos Recientes</h2>
                        <Link href="/dashboard/contracts" className="text-sm text-primary hover:underline flex items-center gap-1">
                            Ver todos <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                    </div>
                    {state.contracts.loading ? (
                        <div className="flex items-center justify-center py-10大爱 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                            <Loader />
                        </div>
                    ) : state.contracts.error ? (
                        <div className="bg-error-container/40 text-on-error p-4 rounded-xl text-center border border-error/20">
                            {state.contracts.error}
                        </div>
                    ) : state.contracts.data.length === 0 ? (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 text-center text-on-surface-variant">
                            No hay contratos recientes.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {state.contracts.data.map((c) => (
                                <ContractCard key={c.id} contract={c} compact />
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-h2 text-primary">Proveedores Recientes</h2>
                        <Link href="/dashboard/suppliers" className="text-sm text-primary hover:underline flex items-center gap-1">
                            Ver todos <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                    </div>
                    {state.suppliers.loading ? (
                        <div className="flex items-center justify-center py-10 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                            <Loader />
                        </div>
                    ) : state.suppliers.error ? (
                        <div className="bg-error-container/40 text-on-error p-4 rounded-xl text-center border border-error/20">
                            {state.suppliers.error}
                        </div>
                    ) : state.suppliers.data.length === 0 ? (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 text-center text-on-surface-variant">
                            No hay proveedores recientes.
                        </div>
                    ) : (
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
                            <ul className="divide-y divide-outline-variant/20">
                                {state.suppliers.data.map((s) => (
                                    <li key={s.id} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${s.isActive ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-variant text-on-surface-variant"}`}>
                                                <span className="material-symbols-outlined text-sm">{s.isActive ? "business" : "domain_disabled"}</span>
                                            </div>
                                            <div>
                                                <p className="text-table-data text-on-surface">{s.name}</p>
                                                {s.nit && <p className="text-body-sm text-on-surface-variant">NIT: {s.nit}</p>}
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${s.isActive ? "bg-secondary-container/20 text-secondary border-secondary/20" : "bg-error-container/40 text-error border-error/20"}`}>
                                            {s.isActive ? "HABILITADO" : "INHABILITADO"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            </div>

            {/* Quick Actions */}
            <section>
                <h2 className="text-h2 text-primary mb-4">Acciones Rápidas</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <QuickActionCard href="/dashboard/admin/users" icon="group" label="Gestionar Usuarios" desc="Crea y administra usuarios del sistema" />
                    <QuickActionCard href="/dashboard/audit" icon="analytics" label="Auditoría" desc="Consulta eventos y trazabilidad" />
                    <QuickActionCard href="/dashboard/contracts" icon="description" label="Contratos" desc="Gestiona el ciclo de vida de contratos" />
                </div>
            </section>
        </div>
    );

    return (
        <main className="px-6 py-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-h1 text-primary mb-2">{renderRoleTitle()}</h1>
                <p className="text-body-md text-on-surface-variant">{renderRoleSubtitle()}</p>
            </div>

            {/* Role-based content */}
            {role === "ADMIN" && renderAdminDashboard()}
            {role === "FUNC" && renderOfficerDashboard()}
            {role === "AUDITOR" && renderAuditorDashboard()}

            {role === null && (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">error</span>
                    <p className="text-body-md text-on-surface-variant">No se pudo determinar tu rol. Por favor, inicia sesión nuevamente.</p>
                </div>
            )}
        </main>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function QuickActionCard({ href, icon, label, desc }: { href: string; icon: string; label: string; desc: string }) {
    return (
        <Link
            href={href}
            className="group block rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {icon}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-table-data font-semibold text-on-surface group-hover:text-primary transition-colors">{label}</h3>
                        <p className="text-body-sm text-on-surface-variant">{desc}</p>
                    </div>
                </div>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform text-[18px]">arrow_forward</span>
            </div>
        </Link>
    );
}

function ContractCard({ contract, compact = false }: { contract: ContractSummary; compact?: boolean }) {
    return (
        <Link href="/dashboard/contracts" className="group block rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-table-data font-semibold text-on-surface group-hover:text-primary transition-colors truncate max-w-[250px]">
                        {contract.contractNumber ?? contract.id}
                    </h3>
                    {!compact && <p className="text-body-sm text-on-surface-variant mt-1 truncate max-w-[250px]">{contract.subject}</p>}
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[18px] mt-0.5">arrow_forward</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <ContractStatusChip status={contract.status} />
                <span className="text-body-sm text-on-surface-variant tabular-nums">{formatCurrency(contract.budget)}</span>
                {!compact && (
                    <span className="text-body-sm text-on-surface-variant">
                        {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
                    </span>
                )}
            </div>
            {contract.supplierName && !compact && (
                <p className="text-body-sm text-on-surface-variant mt-2">Proveedor: {contract.supplierName}</p>
            )}
        </Link>
    );
}

function AuditEventList({ events }: { events: BackendAuditEvent[] }) {
    const serviceOriginLabel: Record<string, string> = {
        "ms-contracts": "CONTRATO",
        "ms-suppliers": "PROVEEDOR",
        "ms-auth": "USUARIO",
        "ms-audit": "ANEXO",
    };

    const getActionColor = (action: string) => {
        if (action === "CREATE") return "bg-secondary-container/20 text-secondary border-secondary/20";
        if (action === "UPDATE") return "bg-primary-fixed/40 text-primary border-primary/20";
        if (action === "DELETE") return "bg-error-container/40 text-error border-error/20";
        return "bg-surface-variant text-on-surface-variant border-surface-variant";
    };

    return (
        <ul className="divide-y divide-outline-variant/20">
            {events.map((ev, idx) => (
                <li key={idx} className="p-4 hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary text-[16px]">history</span>
                        </div>
                        <div>
                            <p className="text-table-data text-on-surface">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border mr-2 ${getActionColor(ev.action)}`}>
                                    {ev.action}
                                </span>
                                {serviceOriginLabel[ev.serviceOrigin] || ev.serviceOrigin}
                            </p>
                            <p className="text-body-sm text-on-surface-variant mt-0.5">
                                {(ev.data?.description as string) || (ev.data?.reason as string) || "Sin descripción"}
                            </p>
                        </div>
                    </div>
                    <span className="text-body-sm text-on-surface-variant whitespace-nowrap flex-shrink-0">
                        {new Date(ev.timestamp).toLocaleString("es-CL", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                </li>
            ))}
        </ul>
    );
}

function ModuleSummaryCard({
    title,
    icon,
    loading,
    error,
    count,
    href,
}: {
    title: string;
    icon: string;
    loading: boolean;
    error: string | null;
    count: number;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group block rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {icon}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-table-data font-semibold text-on-surface group-hover:text-primary transition-colors">{title}</h3>
                        {error ? (
                            <p className="text-body-sm text-error">Error al cargar</p>
                        ) : loading ? (
                            <p className="text-body-sm text-on-surface-variant">Cargando...</p>
                        ) : (
                            <p className="text-body-sm text-on-surface-variant">{count} registros</p>
                        )}
                    </div>
                </div>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform text-[18px]">arrow_forward</span>
            </div>
        </Link>
    );
}

// Helper to read token from sessionStorage
function getToken(): string {
    return sessionStorage.getItem("access_token") || "";
}
