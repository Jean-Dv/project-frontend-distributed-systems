"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApi, resolveErrorMessage } from "@/helpers/use-api.helper";
import { getRole, UserRole } from "@/helpers/auth.helper";
import nextConfig from "@/next.config";
import { StatusChip } from "@/components/ui/StatusChip";
import { Table } from "@/components/ui/Table";
import Loader from "@/components/layouts/Loader";

interface BackendAuditEvent {
    timestamp: string;
    serviceOrigin: string;
    action: string;
    data: Record<string, unknown>;
}

interface AuditFilters {
    contractId: string;
    action: string;
    serviceOrigin: string;
    dateFrom: string;
    dateTo: string;
    executorRole: string;
}

const serviceOriginLabel: Record<string, string> = {
    "ms-contracts": "CONTRATO",
    "ms-suppliers": "PROVEEDOR",
    "ms-auth": "USUARIO",
    "ms-audit": "ANEXO",
};

export default function AuditPage() {
    const { apiFetch } = useApi();
    const [role] = useState<UserRole | null>(() => getRole());
    const [events, setEvents] = useState<BackendAuditEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const initialFetchDone = useRef(false);

    const [filters, setFilters] = useState<AuditFilters>({
        contractId: "",
        action: "",
        serviceOrigin: "",
        dateFrom: "",
        dateTo: "",
        executorRole: "",
    });

    const fetchAuditData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams();
            if (filters.contractId.trim())
                query.set("contractId", filters.contractId.trim());
            if (filters.action.trim())
                query.set("action", filters.action.trim());
            if (filters.serviceOrigin.trim())
                query.set("serviceOrigin", filters.serviceOrigin.trim());
            query.set("from", "0");
            query.set("size", "100");

            const baseUrl = nextConfig.env!.API_BASE_URL;
            const resp = await apiFetch(
                `${baseUrl}/ms-audit/audit?${query.toString()}`,
                {}
            );

            const json = await resp.json();
            const raw = Array.isArray(json)
                ? json
                : json.results || json.data || [];
            setEvents(raw);
        } catch (err: unknown) {
            setError(resolveErrorMessage(err, "No fue posible cargar los datos de auditoría."));
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [apiFetch, filters.contractId, filters.action, filters.serviceOrigin]);

    // Auto-load once on page visit
    useEffect(() => {
        if (!initialFetchDone.current) {
            initialFetchDone.current = true;
            fetchAuditData();
        }
    }, [fetchAuditData]);

    const filteredEvents = events.filter((ev) => {
        const fDateFrom = filters.dateFrom
            ? new Date(filters.dateFrom)
            : null;
        const fDateTo = filters.dateTo ? new Date(filters.dateTo) : null;
        const evDate = new Date(ev.timestamp);
        if (fDateFrom && evDate < fDateFrom) return false;
        if (fDateTo && evDate > fDateTo) return false;
        if (filters.executorRole && ev.data?.role !== filters.executorRole)
            return false;
        return true;
    });

    const canUseFilter = (key: keyof AuditFilters): boolean => {
        if (!role) return false;
        if (role === "ADMIN") return true;
        if (role === "AUDITOR" && key === "contractId") return true;
        return false;
    };

    const updateFilter = (key: keyof AuditFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const getDataValue = (
        data: Record<string, unknown> | undefined,
        key: string
    ): string => {
        if (!data) return "N/A";
        const val = data[key];
        return typeof val === "string" ? val : "N/A";
    };

    return (
        <main className="px-8 py-10 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">
                    Consulta de Historial
                </h1>
                <div className="bg-surface-container text-on-surface py-2 px-4 rounded-lg flex items-center gap-2 border border-outline-variant w-fit">
                    <span
                        className="material-symbols-outlined text-primary"
                        style={
                            { fontVariationSettings: "'FILL' 1" } as React.CSSProperties
                        }
                    >
                        lock
                    </span>
                    <span className="font-body-sm text-body-sm">
                        Los registros de auditoría son inmutables y no pueden
                        ser modificados.
                    </span>
                </div>
            </div>

            {/* Filters Panel */}
            <div className="bg-surface rounded-xl shadow-sm border border-surface-variant p-6 mb-8">
                <h3 className="font-h3 text-h3 text-primary mb-4">
                    Búsqueda Avanzada
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {canUseFilter("contractId") && (
                        <div className="flex flex-col gap-1">
                            <label className="font-label-caps text-label-caps text-on-surface-variant">
                                CONTRATO ID
                            </label>
                            <input
                                type="text"
                                value={filters.contractId}
                                onChange={(e) =>
                                    updateFilter("contractId", e.target.value)
                                }
                                placeholder="CT-2023-001"
                                className="border border-outline-variant rounded-md px-3 py-2 bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm text-on-surface"
                            />
                        </div>
                    )}

                    {canUseFilter("dateFrom") && (
                        <div className="flex flex-col gap-1">
                            <label className="font-label-caps text-label-caps text-on-surface-variant">
                                FECHA DESDE
                            </label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) =>
                                    updateFilter("dateFrom", e.target.value)
                                }
                                className="border border-outline-variant rounded-md px-3 py-2 bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm text-on-surface"
                            />
                        </div>
                    )}

                    {canUseFilter("dateTo") && (
                        <div className="flex flex-col gap-1">
                            <label className="font-label-caps text-label-caps text-on-surface-variant">
                                FECHA HASTA
                            </label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) =>
                                    updateFilter("dateTo", e.target.value)
                                }
                                className="border border-outline-variant rounded-md px-3 py-2 bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm text-on-surface"
                            />
                        </div>
                    )}

                    {canUseFilter("action") && (
                        <div className="flex flex-col gap-1">
                            <label className="font-label-caps text-label-caps text-on-surface-variant">
                                ACCIÓN
                            </label>
                            <select
                                value={filters.action}
                                onChange={(e) =>
                                    updateFilter("action", e.target.value)
                                }
                                className="border border-outline-variant rounded-md px-3 py-2 bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm text-on-surface"
                            >
                                <option value="">TODAS</option>
                                <option value="CREATE">CREAR</option>
                                <option value="UPDATE">ACTUALIZAR</option>
                                <option value="DELETE">ELIMINAR</option>
                            </select>
                        </div>
                    )}

                    {canUseFilter("serviceOrigin") && (
                        <div className="flex flex-col gap-1">
                            <label className="font-label-caps text-label-caps text-on-surface-variant">
                                ENTIDAD
                            </label>
                            <select
                                value={filters.serviceOrigin}
                                onChange={(e) =>
                                    updateFilter(
                                        "serviceOrigin",
                                        e.target.value
                                    )
                                }
                                className="border border-outline-variant rounded-md px-3 py-2 bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm text-on-surface"
                            >
                                <option value="">TODAS</option>
                                <option value="ms-contracts">CONTRATO</option>
                                <option value="ms-suppliers">PROVEEDOR</option>
                                <option value="ms-auth">USUARIO</option>
                            </select>
                        </div>
                    )}

                    {canUseFilter("executorRole") && (
                        <div className="flex flex-col gap-1">
                            <label className="font-label-caps text-label-caps text-on-surface-variant">
                                ROL EJECUTOR
                            </label>
                            <select
                                value={filters.executorRole}
                                onChange={(e) =>
                                    updateFilter(
                                        "executorRole",
                                        e.target.value
                                    )
                                }
                                className="border border-outline-variant rounded-md px-3 py-2 bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm text-on-surface"
                            >
                                <option value="">TODOS</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="FUNC">FUNC</option>
                                <option value="AUDITOR">AUDITOR</option>
                            </select>
                        </div>
                    )}
                </div>

                {role !== "AUDITOR" && role !== "ADMIN" && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={fetchAuditData}
                            className="bg-primary text-on-primary font-table-data text-table-data py-2 px-6 rounded-md hover:bg-primary-fixed-variant transition-colors flex items-center gap-2"
                        >
                            <span
                                className="material-symbols-outlined text-sm"
                                style={
                                    {
                                        fontVariationSettings: "'FILL' 0",
                                    } as React.CSSProperties
                                }
                            >
                                search
                            </span>
                            Aplicar Filtros
                        </button>
                    </div>
                )}

                {(role === "ADMIN" || role === "AUDITOR") && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={fetchAuditData}
                            className="bg-primary text-on-primary font-table-data text-table-data py-2 px-6 rounded-md hover:bg-primary-fixed-variant transition-colors flex items-center gap-2"
                        >
                            <span
                                className="material-symbols-outlined text-sm"
                                style={
                                    {
                                        fontVariationSettings: "'FILL' 0",
                                    } as React.CSSProperties
                                }
                            >
                                search
                            </span>
                            Aplicar Filtros
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 bg-error-container text-on-error p-4 rounded-lg border border-error text-center">
                    {error}
                </div>
            )}

            {/* Table Card */}
            <div className="bg-surface rounded-xl shadow-sm border border-surface-variant overflow-hidden">
                <div className="p-4 border-b border-surface-variant bg-surface-container-low flex justify-between items-center">
                    <h3 className="font-h3 text-h3 text-primary">
                        Registro Inmutable
                    </h3>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Mostrando {filteredEvents.length} evento
                        {filteredEvents.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader />
                    </div>
                ) : (
                    <Table
                        data={filteredEvents}
                        isLoading={false}
                        emptyStateMessage="No se encontraron registros de auditoría."
                        columns={[
                            {
                                header: "OPERACIÓN",
                                accessorKey: "action" as keyof BackendAuditEvent,
                                cell: (item: BackendAuditEvent) => {
                                    const a = item.action;
                                    if (a === "CREATE")
                                        return (
                                            <StatusChip variant="success">
                                                CREATE
                                            </StatusChip>
                                        );
                                    if (a === "UPDATE")
                                        return (
                                            <StatusChip icon="edit">
                                                UPDATE
                                            </StatusChip>
                                        );
                                    if (a === "DELETE")
                                        return (
                                            <StatusChip variant="alert">
                                                DELETE
                                            </StatusChip>
                                        );
                                    return <StatusChip>{a}</StatusChip>;
                                },
                            },
                            {
                                header: "ENTIDAD",
                                accessorKey: "serviceOrigin" as keyof BackendAuditEvent,
                                cell: (item: BackendAuditEvent) => (
                                    <span className="font-table-data text-table-data text-on-surface">
                                        {serviceOriginLabel[
                                            item.serviceOrigin
                                        ] || item.serviceOrigin}
                                    </span>
                                ),
                            },
                            {
                                header: "DESCRIPCIÓN",
                                accessorKey: "timestamp" as keyof BackendAuditEvent,
                                cell: (item: BackendAuditEvent) => (
                                    <span className="font-body-sm text-body-sm text-on-surface">
                                        {getDataValue(
                                            item.data,
                                            "description"
                                        ) ||
                                            getDataValue(item.data, "reason") ||
                                            "N/A"}
                                    </span>
                                ),
                            },
                            {
                                header: "USUARIO",
                                accessorKey: "timestamp" as keyof BackendAuditEvent,
                                cell: (item: BackendAuditEvent) => (
                                    <span className="font-body-sm text-body-sm text-on-surface">
                                        {getDataValue(item.data, "changedBy") ||
                                            getDataValue(item.data, "user") ||
                                            "Sistema"}
                                    </span>
                                ),
                            },
                            {
                                header: "ROL EJECUTOR",
                                accessorKey: "timestamp" as keyof BackendAuditEvent,
                                cell: (item: BackendAuditEvent) => (
                                    <span className="font-table-data text-table-data text-on-surface-variant">
                                        {getDataValue(item.data, "role")}
                                    </span>
                                ),
                            },
                            {
                                header: "TIMESTAMP",
                                accessorKey: "timestamp" as keyof BackendAuditEvent,
                                cell: (item: BackendAuditEvent) => (
                                    <span className="font-table-data text-table-data text-on-surface-variant whitespace-nowrap">
                                        {new Date(
                                            item.timestamp
                                        ).toLocaleString("es-CO", {
                                            year: "numeric",
                                            month: "short",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })}
                                    </span>
                                ),
                            },
                        ]}
                    />
                )}
            </div>
        </main>
    );
}
