"use client";

import { useEffect, useState } from "react";
import { useApi, ApiError } from "@/helpers/use-api.helper";
import { Supplier, SupplierCreatePayload, SupplierEditPayload } from "@/helpers/suppliers.helper";
import { SupplierStatusChip } from "@/components/suppliers/SupplierStatusChip";
import { SupplierCreateModal } from "@/components/suppliers/SupplierCreateModal";
import { SupplierEditModal } from "@/components/suppliers/SupplierEditModal";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function SuppliersPage() {
    const { apiFetch } = useApi();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const loadSuppliers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiFetch(`${API_BASE}/ms-suppliers/suppliers`);
            if (!res.ok) {
                const msg = await res.text().catch(() => "");
                throw new Error(msg || `Error ${res.status}`);
            }
            const data = await res.json();
            setSuppliers(data);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Error al cargar proveedores. Verifique la conexión con el servidor.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadSuppliers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = async (payload: SupplierCreatePayload) => {
        const res = await apiFetch(`${API_BASE}/ms-suppliers/suppliers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const msg = await res.text().catch(() => "");
            throw new Error(msg || `Error ${res.status} al crear el proveedor.`);
        }
        await loadSuppliers();
    };

    const handleEdit = async (id: string, payload: SupplierEditPayload) => {
        const res = await apiFetch(`${API_BASE}/ms-suppliers/suppliers/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                legalRepresentative: payload.legalRepresentative,
                is_active: payload.is_active,
            }),
        });
        if (!res.ok) {
            const msg = await res.text().catch(() => "");
            throw new Error(msg || `Error ${res.status} al actualizar el proveedor.`);
        }
        await loadSuppliers();
    };

    const columns = [
        {
            header: "NIT",
            accessorKey: "nit" as keyof Supplier,
            cell: (row: Supplier) => (
                <span className="text-primary font-semibold">{row.nit}</span>
            ),
        },
        {
            header: "Razón Social",
            accessorKey: "name" as keyof Supplier,
            cell: (row: Supplier) => (
                <span className="font-medium text-on-surface">{row.name}</span>
            ),
        },
        {
            header: "Email",
            accessorKey: "email" as keyof Supplier,
            cell: (row: Supplier) => (
                <span className="text-on-surface-variant">{row.email}</span>
            ),
        },
        {
            header: "Teléfono",
            accessorKey: "phone" as keyof Supplier,
            cell: (row: Supplier) => (
                <span className="text-on-surface-variant">{row.phone}</span>
            ),
        },
        {
            header: "Rep. Legal",
            accessorKey: "legalRepresentative" as keyof Supplier,
            cell: (row: Supplier) => (
                <span className="text-on-surface-variant">{row.legalRepresentative}</span>
            ),
        },
        {
            header: "Estado",
            accessorKey: "is_active" as keyof Supplier,
            cell: (row: Supplier) => <SupplierStatusChip isActive={row.is_active} />,
        },
        {
            header: "",
            accessorKey: "id" as keyof Supplier,
            cell: (row: Supplier) => (
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
        },
    ];

    return (
        <div className="p-8 max-w-[1440px] mx-auto space-y-6">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-h1 text-primary">Gestión de Proveedores</h1>
                    <p className="text-body-md text-on-surface-variant mt-1">
                        Administre y monitoree el directorio de proveedores registrados.
                    </p>
                </div>
                <Button
                    id="new-supplier-btn"
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="self-start md:self-auto"
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

            {/* Error banner */}
            {error && (
                <div className="bg-error-container/40 text-on-error p-4 rounded-xl text-center border border-error/20">
                    {error}
                </div>
            )}

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
                    emptyStateMessage="No se encontraron proveedores. Crea el primero con el botón 'Nuevo Proveedor'."
                />
            </div>

            {/* Create modal */}
            <SupplierCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreate}
            />

            {/* Edit modal */}
            <SupplierEditModal
                supplier={editingSupplier}
                onClose={() => setEditingSupplier(null)}
                onSave={handleEdit}
            />
        </div>
    );
}
