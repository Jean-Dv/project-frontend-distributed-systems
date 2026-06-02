"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Supplier, SupplierEditPayload, SupplierFormErrors } from "@/helpers/suppliers.helper";

interface SupplierEditModalProps {
    supplier: Supplier | null;
    onClose: () => void;
    onSave: (id: string, payload: SupplierEditPayload) => Promise<void>;
}

const inputCls = (hasError: boolean) =>
    `w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 text-sm transition-all ${
        hasError
            ? "outline outline-1 outline-error focus:ring-error"
            : "outline outline-1 outline-outline-variant/50 focus:ring-primary"
    }`;

const labelCls = (hasError: boolean) =>
    `text-label-caps ${hasError ? "text-error" : "text-on-surface-variant"}`;

function validate(payload: Partial<SupplierEditPayload>): SupplierFormErrors {
    const errors: SupplierFormErrors = {};
    if (payload.email !== undefined && payload.email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        errors.email = "Correo electrónico inválido.";
    }
    return errors;
}

export function SupplierEditModal({ supplier, onClose, onSave }: SupplierEditModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [legalRepresentative, setLegalRepresentative] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [errors, setErrors] = useState<SupplierFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (supplier) {
            setName(supplier.name ?? "");
            setEmail(supplier.email ?? "");
            setPhone(supplier.phone ?? "");
            setLegalRepresentative(supplier.legalRepresentative ?? "");
            setIsActive(supplier.isActive ?? true);
            setErrors({});
        }
    }, [supplier]);

    const clearFieldError = (field: keyof SupplierFormErrors) =>
        setErrors((prev) => ({ ...prev, [field]: undefined }));

    const handleSave = async () => {
        const payload: SupplierEditPayload = {};
        if (name?.trim()) payload.name = name.trim();
        if (email?.trim()) payload.email = email.trim();
        if (phone?.trim()) payload.phone = phone.trim();
        if (legalRepresentative?.trim()) payload.legalRepresentative = legalRepresentative.trim();
        payload.isActive = isActive;

        const validationErrors = validate(payload);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(supplier!.id, payload);
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error al actualizar el proveedor.";
            setErrors({ name: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                {/* Supplier summary */}
                {supplier && (
                    <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                        <p className="text-label-caps text-on-surface-variant mb-1">Proveedor</p>
                        <p className="text-body-sm text-on-surface font-semibold">{supplier.name}</p>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">NIT: {supplier.nit}</p>
                    </div>
                )}

                {/* Name */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls(!!errors.name)}>
                        Razón Social
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            business
                        </span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
                            className={inputCls(!!errors.name)}
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls(!!errors.email)}>
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            mail
                        </span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                            className={inputCls(!!errors.email)}
                        />
                    </div>
                    {errors.email && <span className="text-body-sm text-error ml-1">{errors.email}</span>}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls(!!errors.phone)}>
                        Teléfono
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            call
                        </span>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); clearFieldError("phone"); }}
                            className={inputCls(!!errors.phone)}
                        />
                    </div>
                </div>

                {/* Legal Representative */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls(!!errors.legalRepresentative)}>
                        Representante Legal
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            person
                        </span>
                        <input
                            type="text"
                            value={legalRepresentative}
                            onChange={(e) => { setLegalRepresentative(e.target.value); clearFieldError("legalRepresentative"); }}
                            className={inputCls(!!errors.legalRepresentative)}
                        />
                    </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-surface-variant rounded-full peer peer-checked:bg-secondary peer-focus:ring-2 peer-focus:ring-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                    <span className="text-table-data text-on-surface">
                        {isActive ? "Habilitado" : "Inhabilitado"}
                    </span>
                </div>
            </div>
        </Modal>
    );
}
