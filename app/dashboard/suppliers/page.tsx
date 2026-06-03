"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApi, resolveErrorMessage } from "@/helpers/use-api.helper";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import {
    Supplier,
    SupplierCreatePayload,
    SupplierEditPayload,
} from "@/helpers/suppliers.helper";
import { SupplierStatusChip } from "@/components/suppliers/SupplierStatusChip";
import { SupplierCreateForm } from "@/components/suppliers/SupplierCreateForm";
import { SupplierEditModal } from "@/components/suppliers/SupplierEditModal";
import { getRole } from "@/helpers/auth.helper";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:8080";
const SUPPLIERS_ENDPOINT = `${API_BASE}/ms-suppliers/suppliers`;

function normalizeList<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && "content" in data) {
        return (data as { content: T[] }).content ?? [];
    }
    return [];
}

export default function SuppliersPage() {
    const { apiFetch } = useApi();

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const createFormRef = useRef<HTMLDivElement>(null);

    const isAdmin = role === "ADMIN";

    const loadSuppliers = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch(SUPPLIERS_ENDPOINT);
            const data = await res.json();
            setSuppliers(normalizeList<Supplier>(data));
        } catch (err: unknown) {
            toast.error(resolveErrorMessage(err, "No fue posible cargar los proveedores."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setRole(getRole());
        void loadSuppliers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = async (payload: SupplierCreatePayload) => {
        await apiFetch(SUPPLIERS_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        toast.success("Proveedor registrado correctamente.");
        await loadSuppliers();
    };

    const handleEdit = async (id: string, payload: SupplierEditPayload) => {
        await apiFetch(`${SUPPLIERS_ENDPOINT}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setEditingSupplier(null);
        toast.success("Proveedor actualizado correctamente.");
        await loadSuppliers();
    };

    const scrollToCreateForm = () => {
        createFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    type Column = {
        header: React.ReactNode;
        accessorKey: keyof Supplier | string;
        cell?: (row: Supplier) => React.ReactNode;
    };

    const columns: Column[] = [
        {
            header: "NIT",
            accessorKey: "nit",
            cell: (row) => (
                <span className="text-primary font-semibold tabular-nums">{row.nit}</span>
            ),
        },
        {
            header: "Nombre / razón social",
            accessorKey: "name",
            cell: (row) => (
                <span className="font-medium text-on-surface">{row.name}</span>
            ),
        },
        {
            header: "Representante legal",
            accessorKey: "legalRepresentative",
            cell: (row) => (
                <span className="text-on-surface-variant">{row.legalRepresentative}</span>
            ),
        },
        {
            header: "Correo",
            accessorKey: "email",
            cell: (row) => (
                <a
                    href={`mailto:${row.email}`}
                    className="text-primary hover:underline break-all"
                >
                    {row.email}
                </a>
            ),
        },
        {
            header: "Teléfono",
            accessorKey: "phone",
            cell: (row) => (
                <span className="text-on-surface-variant whitespace-nowrap">{row.phone}</span>
            ),
        },
        {
            header: "Estado",
            accessorKey: "isActive",
            cell: (row) => <SupplierStatusChip isActive={row.isActive} />,
        },
    ];

    if (isAdmin) {
        // Add the button edit to the end of the columns if the user is an admin
        columns.push({
            header: "",
            accessorKey: "id",
            cell: (row) => (
                <button
                    type="button"
                    id={`edit-supplier-${row.id}`}
                    onClick={() => setEditingSupplier(row)}
                    title="Editar proveedor"
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
            ),
        });
    }

    const enabledCount = suppliers.filter((s) => s.isActive).length;

    return (
        <div className="p-8 max-w-[1440px] mx-auto space-y-6">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-h1 text-primary">Gestión de Proveedores</h1>
                    <p className="text-body-md text-on-surface-variant mt-1">
                        Registra y mantén actualizado el catálogo de proveedores del sistema.
                    </p>
                </div>
                <div className="flex items-center gap-3 self-start md:self-auto">
                    <span className="text-label-caps text-on-surface-variant">
                        {enabledCount} de {suppliers.length} habilitados
                    </span>
                    <Button
                        id="new-supplier-btn"
                        variant="primary"
                        onClick={scrollToCreateForm}
                    >
                        <span
                            className="material-symbols-outlined text-sm mr-1"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            add
                        </span>
                        Nuevo Proveedor
                    </Button>
                </div>
            </div>

            {/* Suppliers table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant/30 overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-white">
                    <h2 className="text-h3 text-primary">Proveedores</h2>
                    <button
                        type="button"
                        onClick={() => void loadSuppliers()}
                        title="Actualizar lista"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                    </button>
                </div>
                <Table<Supplier>
                    data={suppliers}
                    columns={columns}
                    isLoading={isLoading}
                    emptyStateMessage="No hay proveedores registrados. Registra el primero con el botón 'Nuevo Proveedor'."
                />
            </div>

            {/* Create form */}
            <div ref={createFormRef}>
                <SupplierCreateForm onSubmit={handleCreate} />
            </div>

            <SupplierEditModal
                supplier={editingSupplier}
                onClose={() => setEditingSupplier(null)}
                onSave={handleEdit}
            />
        </div>
    );
}
