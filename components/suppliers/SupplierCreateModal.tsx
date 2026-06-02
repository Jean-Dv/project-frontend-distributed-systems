"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SupplierCreatePayload, SupplierFormErrors } from "@/helpers/suppliers.helper";

interface SupplierCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: SupplierCreatePayload) => Promise<void>;
}

const inputCls = (hasError: boolean) =>
    `w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 text-sm transition-all ${
        hasError
            ? "outline outline-1 outline-error focus:ring-error"
            : "outline outline-1 outline-outline-variant/50 focus:ring-primary"
    }`;

const labelCls = (hasError: boolean) =>
    `text-label-caps ${hasError ? "text-error" : "text-on-surface-variant"}`;

function validate(payload: Partial<SupplierCreatePayload>): SupplierFormErrors {
    const errors: SupplierFormErrors = {};
    if (!payload.nit?.trim()) errors.nit = "El NIT es requerido.";
    if (!payload.name?.trim()) errors.name = "El nombre o razón social es requerido.";
    if (!payload.email?.trim()) errors.email = "El correo electrónico es requerido.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.email = "Correo electrónico inválido.";
    if (!payload.phone?.trim()) errors.phone = "El número de teléfono es requerido.";
    if (!payload.legalRepresentative?.trim()) errors.legalRepresentative = "El nombre del representante legal es requerido.";
    return errors;
}

export function SupplierCreateModal({ isOpen, onClose, onSubmit }: SupplierCreateModalProps) {
    const [nit, setNit] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [legalRepresentative, setLegalRepresentative] = useState("");
    const [errors, setErrors] = useState<SupplierFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const clearFieldError = (field: keyof SupplierFormErrors) =>
        setErrors((prev) => ({ ...prev, [field]: undefined }));

    const handleSubmit = async () => {
        const payload: Partial<SupplierCreatePayload> = { nit, name, email, phone, legalRepresentative };
        const validationErrors = validate(payload);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        try {
            await onSubmit(payload as SupplierCreatePayload);
            setNit("");
            setName("");
            setEmail("");
            setPhone("");
            setLegalRepresentative("");
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error al crear el proveedor.";
            setErrors({ name: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nuevo Proveedor"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        id="supplier-create-btn"
                    >
                        <span className="material-symbols-outlined text-sm mr-1">add</span>
                        Crear Proveedor
                    </Button>
                </>
            }
        >
            <div className="space-y-5">
                {/* NIT */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls(!!errors.nit)}>
                        NIT <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            badge
                        </span>
                        <input
                            type="text"
                            value={nit}
                            onChange={(e) => { setNit(e.target.value); clearFieldError("nit"); }}
                            placeholder="123456789-0"
                            className={inputCls(!!errors.nit)}
                        />
                    </div>
                    {errors.nit && <span className="text-body-sm text-error ml-1">{errors.nit}</span>}
                </div>

                {/* Name */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls(!!errors.name)}>
                        Razón Social <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            business
                        </span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
                            placeholder="Nombre del proveedor o razón social"
                            className={inputCls(!!errors.name)}
                        />
                    </div>
                    {errors.name && <span className="text-body-sm text-error ml-1">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls(!!errors.email)}>
                        Correo Electrónico <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            mail
                        </span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                            placeholder="proveedor@ejemplo.com"
                            className={inputCls(!!errors.email)}
                        />
                    </div>
                    {errors.email && <span className="text-body-sm text-error ml-1">{errors.email}</span>}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls(!!errors.phone)}>
                        Teléfono <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            call
                        </span>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); clearFieldError("phone"); }}
                            placeholder="+57 300 123 4567"
                            className={inputCls(!!errors.phone)}
                        />
                    </div>
                    {errors.phone && <span className="text-body-sm text-error ml-1">{errors.phone}</span>}
                </div>

                {/* Legal Representative */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls(!!errors.legalRepresentative)}>
                        Representante Legal <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            person
                        </span>
                        <input
                            type="text"
                            value={legalRepresentative}
                            onChange={(e) => { setLegalRepresentative(e.target.value); clearFieldError("legalRepresentative"); }}
                            placeholder="Nombre del representante legal"
                            className={inputCls(!!errors.legalRepresentative)}
                        />
                    </div>
                    {errors.legalRepresentative && (
                        <span className="text-body-sm text-error ml-1">{errors.legalRepresentative}</span>
                    )}
                </div>
            </div>
        </Modal>
    );
}
