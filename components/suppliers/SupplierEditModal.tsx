"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
    Supplier,
    SupplierEditErrors,
    SupplierEditPayload,
    validateSupplierEdit,
} from "@/helpers/suppliers.helper";

interface SupplierEditModalProps {
    supplier: Supplier | null;
    onClose: () => void;
    onSave: (id: string, payload: SupplierEditPayload) => Promise<void>;
}

export function SupplierEditModal({ supplier, onClose, onSave }: SupplierEditModalProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [errors, setErrors] = useState<SupplierEditErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (supplier) {
            setName(supplier.name);
            setPhone(supplier.phone);
            setIsActive(supplier.isActive);
            setErrors({});
        }
    }, [supplier]);

    const clearFieldError = (field: keyof SupplierEditErrors) =>
        setErrors((prev) => ({ ...prev, [field]: undefined }));

    const handleSave = async () => {
        const payload: Partial<SupplierEditPayload> = {
            name: name.trim(),
            phone: phone.trim(),
            isActive,
        };

        const validationErrors = validateSupplierEdit(payload);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(supplier!.id, payload as SupplierEditPayload);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error al actualizar el proveedor.";
            setErrors({ name: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const fieldCls = (hasError: boolean) =>
        `w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 text-sm transition-all ${
            hasError
                ? "outline outline-1 outline-error focus:ring-error"
                : "outline outline-1 outline-outline-variant/50 focus:ring-primary"
        }`;

    const readonlyCls =
        "w-full pl-12 pr-4 py-3.5 bg-surface-container-high rounded text-on-surface-variant text-sm outline outline-1 outline-outline-variant/30 cursor-not-allowed";

    return (
        <Modal
            isOpen={!!supplier}
            onClose={onClose}
            title="Editar Proveedor"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        isLoading={isSubmitting}
                        id="supplier-edit-save-btn"
                    >
                        <span className="material-symbols-outlined text-sm mr-1">save</span>
                        Guardar cambios
                    </Button>
                </>
            }
        >
            <div className="space-y-5">
                {supplier && (
                    <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 space-y-1">
                        <p className="text-label-caps text-on-surface-variant">Proveedor</p>
                        <p className="text-body-sm text-on-surface font-semibold">
                            NIT: {supplier.nit}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">
                            Representante legal: {supplier.legalRepresentative}
                        </p>
                    </div>
                )}

                {/* Read-only NIT */}
                <div className="flex flex-col gap-2">
                    <label className="text-label-caps text-on-surface-variant">
                        NIT (no editable)
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            badge
                        </span>
                        <input
                            type="text"
                            value={supplier?.nit ?? ""}
                            readOnly
                            disabled
                            className={readonlyCls}
                        />
                    </div>
                </div>

                {/* Read-only email */}
                <div className="flex flex-col gap-2">
                    <label className="text-label-caps text-on-surface-variant">
                        Correo electrónico (no editable)
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            mail
                        </span>
                        <input
                            type="email"
                            value={supplier?.email ?? ""}
                            readOnly
                            disabled
                            className={readonlyCls}
                        />
                    </div>
                </div>

                {/* Read-only legal representative */}
                <div className="flex flex-col gap-2">
                    <label className="text-label-caps text-on-surface-variant">
                        Representante legal (no editable)
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            person
                        </span>
                        <input
                            type="text"
                            value={supplier?.legalRepresentative ?? ""}
                            readOnly
                            disabled
                            className={readonlyCls}
                        />
                    </div>
                </div>

                {/* Editable: name */}
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="supplier-edit-name"
                        className={`text-label-caps ${
                            errors.name ? "text-error" : "text-on-surface-variant"
                        }`}
                    >
                        Nombre o razón social <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            business
                        </span>
                        <input
                            id="supplier-edit-name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                clearFieldError("name");
                            }}
                            className={fieldCls(!!errors.name)}
                        />
                    </div>
                    {errors.name && (
                        <span className="text-body-sm text-error ml-1">{errors.name}</span>
                    )}
                </div>

                {/* Editable: phone */}
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="supplier-edit-phone"
                        className={`text-label-caps ${
                            errors.phone ? "text-error" : "text-on-surface-variant"
                        }`}
                    >
                        Teléfono <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            call
                        </span>
                        <input
                            id="supplier-edit-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                clearFieldError("phone");
                            }}
                            className={fieldCls(!!errors.phone)}
                        />
                    </div>
                    {errors.phone && (
                        <span className="text-body-sm text-error ml-1">{errors.phone}</span>
                    )}
                </div>

                {/* Editable: status */}
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="supplier-edit-status"
                        className={`text-label-caps ${
                            errors.isActive ? "text-error" : "text-on-surface-variant"
                        }`}
                    >
                        Estado <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            flag
                        </span>
                        <select
                            id="supplier-edit-status"
                            value={isActive ? "true" : "false"}
                            onChange={(e) => {
                                setIsActive(e.target.value === "true");
                                clearFieldError("isActive");
                            }}
                            className={`${fieldCls(!!errors.isActive)} appearance-none cursor-pointer`}
                        >
                            <option value="true">Habilitado</option>
                            <option value="false">Inhabilitado</option>
                        </select>
                    </div>
                    {errors.isActive && (
                        <span className="text-body-sm text-error ml-1">{errors.isActive}</span>
                    )}
                </div>
            </div>
        </Modal>
    );
}
