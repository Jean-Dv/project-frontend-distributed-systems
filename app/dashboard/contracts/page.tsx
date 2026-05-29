"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApi } from "@/helpers/use-api.helper";
import { getRole } from "@/helpers/auth.helper";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import {
    Contract,
    ContractCreatePayload,
    ContractEditPayload,
    Supplier,
    formatCurrency,
    formatDate,
} from "@/helpers/contracts.helper";
import { ContractStatusChip } from "@/components/contracts/ContractStatusChip";
import { ContractCreateForm } from "@/components/contracts/ContractCreateForm";
import { ContractEditModal } from "@/components/contracts/ContractEditModal";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:8080";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeList<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && "content" in data) {
        return (data as { content: T[] }).content ?? [];
    }
    return [];
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContractsPage() {
    const { apiFetch } = useApi();

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoadingContracts, setIsLoadingContracts] = useState(true);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);

    const createFormRef = useRef<HTMLDivElement>(null);

    const isOfficer = role === "FUNC";

    // ── Data loading ──────────────────────────────────────────────────────────

    const loadContracts = async () => {
        setIsLoadingContracts(true);
        try {
            const res = await apiFetch(`${API_BASE}/ms-contracts/contracts`);
            if (res.ok) {
                const data = await res.json();
                setContracts(normalizeList<Contract>(data));
            } else {
                toast.error("Error al cargar los contratos.");
            }
        } catch {
            toast.error("Error de conexión. Verifique que el servidor esté disponible.");
        } finally {
            setIsLoadingContracts(false);
        }
    };

    const loadSuppliers = async () => {
        setIsLoadingSuppliers(true);
        try {
            const res = await apiFetch(`${API_BASE}/ms-suppliers/suppliers`);
            if (res.ok) {
                const data = await res.json();
                setSuppliers(normalizeList<Supplier>(data));
            }
        } catch {
            // Supplier panel is secondary — fail silently
        } finally {
            setIsLoadingSuppliers(false);
        }
    };

    useEffect(() => {
        setRole(getRole());
        void loadContracts();
        void loadSuppliers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleCreate = async (payload: ContractCreatePayload) => {
        // 1. Crear contrato
        const createRes = await apiFetch(`${API_BASE}/ms-contracts/contracts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!createRes.ok) {
            const msg = await createRes.text().catch(() => "");
            throw new Error(msg || `Error ${createRes.status} al crear el contrato.`);
        }

        // 2. Obtener respuesta de creación
        const createdContract = await createRes.json();
        const contractId = createdContract.id;

        console.log({contractId})

        if (!contractId) {
            throw new Error("No se recibió el ID del contrato creado.");
        }

        // 3. Obtener PDF
        const pdfRes = await apiFetch(
            `${API_BASE}/ms-contracts/contracts/${contractId}/pdf`,
            {
                method: "GET"
            }
        );

        if (!pdfRes.ok) {
            const msg = await pdfRes.text().catch(() => "");
            throw new Error(msg || `Error ${pdfRes.status} al descargar el PDF.`);
        }

        // 4. Descargar PDF
        const blob = await pdfRes.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `contrato-${contractId}.pdf`;

        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);

        toast.success("¡Contrato creado! El PDF se ha descargado automáticamente.");

        // 5. Recargar contratos
        await loadContracts();
    };

    const handleEdit = async (id: string, payload: ContractEditPayload) => {
        const res = await apiFetch(`${API_BASE}/ms-contracts/contracts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const msg = await res.text().catch(() => "");
            throw new Error(msg || `Error ${res.status} al actualizar el contrato.`);
        }

        setEditingContract(null);
        toast.success("Contrato actualizado correctamente.");
        await loadContracts();
    };

    const scrollToCreateForm = () => {
        createFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // ── Table columns ─────────────────────────────────────────────────────────

    type Column = {
        header: React.ReactNode;
        accessorKey: keyof Contract | string;
        cell?: (row: Contract) => React.ReactNode;
    };

    const columns: Column[] = [
        {
            header: "Número",
            accessorKey: "contractNumber",
            cell: (row) => (
                <span className="text-primary font-semibold">
                    {row.contractNumber ?? row.id}
                </span>
            ),
        },
        {
            header: "Proveedor",
            accessorKey: "supplierName",
            cell: (row) => (
                <span className="font-medium text-on-surface">{row.supplierName ?? "—"}</span>
            ),
        },
        {
            header: "Objeto",
            accessorKey: "subject",
            cell: (row) => (
                <span
                    className="text-on-surface-variant max-w-[200px] block truncate"
                    title={row.subject}
                >
                    {row.subject}
                </span>
            ),
        },
        {
            header: <span className="block text-right">Presupuesto</span>,
            accessorKey: "budget",
            cell: (row) => (
                <span className="block text-right tabular-nums">{formatCurrency(row.budget)}</span>
            ),
        },
        {
            header: "Período",
            accessorKey: "startDate",
            cell: (row) => (
                <span className="text-on-surface-variant whitespace-nowrap">
                    {formatDate(row.startDate)} – {formatDate(row.endDate)}
                </span>
            ),
        },
        {
            header: "Estado",
            accessorKey: "status",
            cell: (row) => <ContractStatusChip status={row.status} />,
        },
        {
            header: "Versión",
            accessorKey: "version",
            cell: (row) => (
                <span className="text-on-surface-variant">{row.version ?? "v1"}</span>
            ),
        },
        // Edit action — FUNC only
        ...(isOfficer
            ? [
                  {
                      header: "",
                      accessorKey: "id",
                      cell: (row: Contract) => (
                          <button
                              type="button"
                              id={`edit-contract-${row.id}`}
                              onClick={() => setEditingContract(row)}
                              title="Editar contrato"
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                      ),
                  } satisfies Column,
              ]
            : []),
    ];

    // ── Derived supplier data for sidebar ─────────────────────────────────────

    const enabledCount = suppliers.filter((s) => s.isActive).length;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="p-8 max-w-[1440px] mx-auto space-y-6">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-h1 text-primary">Gestión de Contratos</h1>
                    <p className="text-body-md text-on-surface-variant mt-1">
                        Administre y monitoree el ciclo de vida de los contratos activos.
                    </p>
                </div>
                {isOfficer && (
                    <Button
                        id="new-contract-btn"
                        variant="primary"
                        onClick={scrollToCreateForm}
                        className="self-start md:self-auto"
                    >
                        <span
                            className="material-symbols-outlined text-sm mr-1"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            add
                        </span>
                        Nuevo Contrato
                    </Button>
                )}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* ── Left column: table + create form ─────────────────────── */}
                <div className="xl:col-span-2 space-y-5">
                    {/* Contracts table */}
                    <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant/30 overflow-hidden">
                        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-white">
                            <h2 className="text-h3 text-primary">Contratos</h2>
                            <button
                                type="button"
                                onClick={() => void loadContracts()}
                                title="Actualizar lista"
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                            </button>
                        </div>
                        <Table<Contract>
                            data={contracts}
                            columns={columns}
                            isLoading={isLoadingContracts}
                            emptyStateMessage="No se encontraron contratos. Crea el primero con el botón 'Nuevo Contrato'."
                        />
                    </div>

                    {/* Creation form — FUNC only */}
                    {isOfficer && (
                        <div ref={createFormRef}>
                            <ContractCreateForm
                                suppliers={suppliers}
                                isLoadingSuppliers={isLoadingSuppliers}
                                onSubmit={handleCreate}
                            />
                        </div>
                    )}
                </div>

                {/* ── Right column: suppliers panel ────────────────────────── */}
                <div>
                    <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant/30 flex flex-col max-h-[700px]">
                        {/* Panel header */}
                        <div className="px-6 py-4 border-b border-outline-variant/30 bg-white">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-surface-tint">domain</span>
                                <h2 className="text-h3 text-primary">Proveedores</h2>
                            </div>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                Directorio de entidades registradas
                            </p>
                        </div>

                        {/* Supplier list */}
                        <div className="flex-1 overflow-y-auto p-3">
                            {isLoadingSuppliers ? (
                                <div className="flex items-center justify-center py-10">
                                    <span className="material-symbols-outlined animate-loader text-primary text-3xl">
                                        progress_activity
                                    </span>
                                </div>
                            ) : suppliers.length === 0 ? (
                                <p className="text-body-sm text-on-surface-variant text-center py-10">
                                    No hay proveedores registrados.
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {suppliers.map((supplier) => {
                                        return (
                                            <li
                                                key={supplier.id}
                                                className={`p-3 rounded-lg border border-transparent hover:border-outline-variant/20 hover:bg-surface-container-low transition-colors flex items-start justify-between gap-3 ${
                                                    !supplier.isActive ? "opacity-55" : ""
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                            supplier.isActive
                                                                ? "bg-primary-fixed text-on-primary-fixed"
                                                                : "bg-surface-variant text-on-surface-variant"
                                                        }`}
                                                    >
                                                        <span
                                                            className="material-symbols-outlined text-sm"
                                                            style={
                                                                supplier.isActive
                                                                    ? { fontVariationSettings: "'FILL' 1" }
                                                                    : {}
                                                            }
                                                        >
                                                            {supplier.isActive ? "business" : "domain_disabled"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-table-data text-on-surface leading-tight">
                                                            {supplier.name}
                                                        </p>
                                                        {supplier.nit && (
                                                            <p className="text-body-sm text-on-surface-variant mt-0.5">
                                                                NIT: {supplier.nit}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${
                                                        supplier.isActive
                                                            ? "bg-secondary-container/20 text-secondary border-secondary/20"
                                                            : "bg-error-container/40 text-error border-error/20"
                                                    }`}
                                                >
                                                    {supplier.isActive ? "HABILITADO" : "INHABILITADO"}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Panel footer */}
                        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low">
                            <p className="text-label-caps text-on-surface-variant text-center">
                                {enabledCount} de {suppliers.length} habilitados
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit modal — rendered outside the grid to avoid stacking-context issues */}
            <ContractEditModal
                contract={editingContract}
                onClose={() => setEditingContract(null)}
                onSave={handleEdit}
            />
        </div>
    );
}