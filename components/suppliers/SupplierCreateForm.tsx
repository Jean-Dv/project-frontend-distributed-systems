"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { resolveErrorMessage } from "@/helpers/use-api.helper";
import {
    SupplierCreateErrors,
    SupplierCreatePayload,
    validateSupplierCreate,
} from "@/helpers/suppliers.helper";

interface SupplierCreateFormProps {
    onSubmit: (payload: SupplierCreatePayload) => Promise<void>;
}

export function SupplierCreateForm({ onSubmit }: SupplierCreateFormProps) {
    const [nit, setNit] = useState("");
    const [name, setName] = useState("");
    const [legalRepresentative, setLegalRepresentative] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [errors, setErrors] = useState<SupplierCreateErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const clearFieldError = (field: keyof SupplierCreateErrors) =>
        setErrors((prev) => ({ ...prev, [field]: undefined }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: Partial<SupplierCreatePayload> = {
            nit: nit.trim(),
            name: name.trim(),
            legalRepresentative: legalRepresentative.trim(),
            email: email.trim(),
            phone: phone.trim(),
        };

        const validationErrors = validateSupplierCreate(payload);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setFormError(null);
        try {
            await onSubmit(payload as SupplierCreatePayload);
            setNit("");
            setName("");
            setLegalRepresentative("");
            setEmail("");
            setPhone("");
        } catch (err: unknown) {
            setFormError(resolveErrorMessage(err, "No fue posible registrar el proveedor."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = (hasError: boolean) =>
        `w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 text-sm transition-all ${
            hasError
                ? "outline outline-1 outline-error focus:ring-error"
                : "outline outline-1 outline-outline-variant/50 focus:ring-primary"
        }`;

    const labelCls = (hasError: boolean) =>
        `text-label-caps ${hasError ? "text-error" : "text-on-surface-variant"}`;

    return (
        <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant/30 relative overflow-hidden">
            {isSubmitting && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined animate-loader text-primary text-5xl">
                        progress_activity
                    </span>
                    <p className="text-h3 text-primary">Registrando proveedor…</p>
                </div>
            )}

            <div className="flex items-center gap-2 px-6 py-4 border-b border-outline-variant/30 bg-white">
                <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    add_business
                </span>
                <h2 className="text-h3 text-primary">Registro de Proveedor</h2>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6">
                {formError && (
                    <Alert variant="error">{formError}</Alert>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NIT */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="supplier-nit" className={labelCls(!!errors.nit)}>
                            NIT <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                                badge
                            </span>
                            <input
                                id="supplier-nit"
                                type="text"
                                value={nit}
                                onChange={(e) => {
                                    setNit(e.target.value);
                                    clearFieldError("nit");
                                }}
                                placeholder="Ej: 900123456-7"
                                className={inputCls(!!errors.nit)}
                            />
                        </div>
                        {errors.nit && (
                            <span className="text-body-sm text-error ml-1">{errors.nit}</span>
                        )}
                    </div>

                    {/* Name / razón social */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="supplier-name" className={labelCls(!!errors.name)}>
                            Nombre o razón social <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                                business
                            </span>
                            <input
                                id="supplier-name"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    clearFieldError("name");
                                }}
                                placeholder="Ej: Proveedora Andina S.A.S."
                                className={inputCls(!!errors.name)}
                            />
                        </div>
                        {errors.name && (
                            <span className="text-body-sm text-error ml-1">{errors.name}</span>
                        )}
                    </div>

                    {/* Legal representative */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="supplier-legal-rep"
                            className={labelCls(!!errors.legalRepresentative)}
                        >
                            Representante legal <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                                person
                            </span>
                            <input
                                id="supplier-legal-rep"
                                type="text"
                                value={legalRepresentative}
                                onChange={(e) => {
                                    setLegalRepresentative(e.target.value);
                                    clearFieldError("legalRepresentative");
                                }}
                                placeholder="Ej: María Pérez"
                                className={inputCls(!!errors.legalRepresentative)}
                            />
                        </div>
                        {errors.legalRepresentative && (
                            <span className="text-body-sm text-error ml-1">
                                {errors.legalRepresentative}
                            </span>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="supplier-email" className={labelCls(!!errors.email)}>
                            Correo electrónico <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                                mail
                            </span>
                            <input
                                id="supplier-email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    clearFieldError("email");
                                }}
                                placeholder="contacto@proveedor.com"
                                className={inputCls(!!errors.email)}
                            />
                        </div>
                        {errors.email && (
                            <span className="text-body-sm text-error ml-1">{errors.email}</span>
                        )}
                    </div>

                    {/* Phone — full width */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label htmlFor="supplier-phone" className={labelCls(!!errors.phone)}>
                            Teléfono <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                                call
                            </span>
                            <input
                                id="supplier-phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    clearFieldError("phone");
                                }}
                                placeholder="Ej: +57 301 123 4567"
                                className={inputCls(!!errors.phone)}
                            />
                        </div>
                        {errors.phone && (
                            <span className="text-body-sm text-error ml-1">{errors.phone}</span>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant/30">
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={isSubmitting}
                        id="supplier-submit-btn"
                    >
                        <span className="material-symbols-outlined text-sm mr-1">save</span>
                        Registrar proveedor
                    </Button>
                </div>
            </form>
        </div>
    );
}
