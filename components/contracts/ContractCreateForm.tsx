"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { resolveErrorMessage } from "@/helpers/use-api.helper";
import {
    ContractCreatePayload,
    ContractFormErrors,
    MIN_WORDS,
    Supplier,
    countWords,
    validateContractCreate,
} from "@/helpers/contracts.helper";

interface ContractCreateFormProps {
    suppliers: Supplier[];
    isLoadingSuppliers?: boolean;
    onSubmit: (payload: ContractCreatePayload) => Promise<void>;
}

export function ContractCreateForm({
    suppliers,
    isLoadingSuppliers = false,
    onSubmit,
}: ContractCreateFormProps) {
    const [supplierId, setSupplierId] = useState("");
    const [budget, setBudget] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [subject, setSubject] = useState("");
    const [errors, setErrors] = useState<ContractFormErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const wordCount = countWords(subject);
    const wordProgress = Math.min((wordCount / MIN_WORDS) * 100, 100);
    const enabledSuppliers = suppliers.filter((s) => s.isActive);

    const clearFieldError = (field: keyof ContractFormErrors) =>
        setErrors((prev) => ({ ...prev, [field]: undefined }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: Partial<ContractCreatePayload> = {
            supplierId,
            subject,
            startDate,
            endDate,
            budget: Number(budget),
        };

        const validationErrors = validateContractCreate(payload);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setFormError(null);
        try {
            await onSubmit(payload as ContractCreatePayload);
            // Reset on success
            setSupplierId("");
            setBudget("");
            setStartDate("");
            setEndDate("");
            setSubject("");
        } catch (err: unknown) {
            setFormError(resolveErrorMessage(err, "No fue posible crear el contrato."));
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Shared input class builder ────────────────────────────────────────────
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
            {/* ── Loading overlay ──────────────────────────────────────────── */}
            {isSubmitting && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined animate-loader text-primary text-5xl">
                        progress_activity
                    </span>
                    <p className="text-h3 text-primary">Generando PDF…</p>
                    <p className="text-body-sm text-on-surface-variant">
                        Por favor espere mientras se procesa el documento.
                    </p>
                </div>
            )}

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-outline-variant/30 bg-white">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    add_circle
                </span>
                <h2 className="text-h3 text-primary">Creación de Contrato</h2>
            </div>

            {/* ── Form ────────────────────────────────────────────────────── */}
            <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6">
                {formError && (
                    <Alert variant="error">{formError}</Alert>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Supplier select — full width */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className={labelCls(!!errors.supplierId)}>
                            Proveedor <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                                business
                            </span>
                            <select
                                id="contract-supplier"
                                value={supplierId}
                                disabled={isLoadingSuppliers}
                                onChange={(e) => {
                                    setSupplierId(e.target.value);
                                    clearFieldError("supplierId");
                                }}
                                className={`${inputCls(!!errors.supplierId)} appearance-none cursor-pointer`}
                            >
                                <option value="">
                                    {isLoadingSuppliers
                                        ? "Cargando proveedores…"
                                        : "Seleccione un proveedor habilitado"}
                                </option>
                                {enabledSuppliers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                        {s.nit ? ` — ${s.nit}` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.supplierId ? (
                            <span className="text-body-sm text-error ml-1">{errors.supplierId}</span>
                        ) : (
                            <span className="text-body-sm text-on-surface-variant ml-1">
                                Solo se muestran proveedores con estado HABILITADO.
                            </span>
                        )}
                    </div>

                    {/* Budget */}
                    <div className="flex flex-col gap-2">
                        <label className={labelCls(!!errors.budget)}>
                            Presupuesto Estimado <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                                payments
                            </span>
                            <input
                                id="contract-budget"
                                type="number"
                                min="0"
                                step="0.01"
                                value={budget}
                                onChange={(e) => {
                                    setBudget(e.target.value);
                                    clearFieldError("budget");
                                }}
                                placeholder="0.00"
                                className={inputCls(!!errors.budget)}
                            />
                        </div>
                        {errors.budget && (
                            <span className="text-body-sm text-error ml-1">{errors.budget}</span>
                        )}
                    </div>

                    {/* Date pair */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Start date */}
                        <div className="flex flex-col gap-2">
                            <label className={labelCls(!!errors.startDate)}>
                                Fecha Inicio <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                                    calendar_today
                                </span>
                                <input
                                    id="contract-start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        clearFieldError("startDate");
                                        clearFieldError("endDate");
                                    }}
                                    className={`${inputCls(!!errors.startDate)} pr-2`}
                                />
                            </div>
                            {errors.startDate && (
                                <span className="text-body-sm text-error ml-1">{errors.startDate}</span>
                            )}
                        </div>

                        {/* End date */}
                        <div className="flex flex-col gap-2">
                            <label className={labelCls(!!errors.endDate)}>
                                Fecha Fin <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                                    event
                                </span>
                                <input
                                    id="contract-end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        clearFieldError("endDate");
                                    }}
                                    className={`${inputCls(!!errors.endDate)} pr-2`}
                                />
                            </div>
                            {errors.endDate && (
                                <span className="text-body-sm text-error ml-1">{errors.endDate}</span>
                            )}
                        </div>
                    </div>

                    {/* Subject textarea — full width */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className={labelCls(!!errors.subject)}>
                                Objeto del Contrato <span className="text-error">*</span>
                            </label>
                            <span
                                className={`text-label-caps transition-colors ${
                                    wordCount >= MIN_WORDS
                                        ? "text-secondary"
                                        : "text-on-surface-variant"
                                }`}
                            >
                                {wordCount} / {MIN_WORDS} palabras mín.
                            </span>
                        </div>
                        <textarea
                            id="contract-subject"
                            value={subject}
                            onChange={(e) => {
                                setSubject(e.target.value);
                                clearFieldError("subject");
                            }}
                            rows={6}
                            placeholder="Describa el objeto principal del contrato detalladamente…"
                            className={`w-full px-4 py-3 bg-surface-container-low rounded text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 text-sm resize-none transition-all ${
                                errors.subject
                                    ? "outline outline-1 outline-error focus:ring-error"
                                    : "outline outline-1 outline-outline-variant/50 focus:ring-primary"
                            }`}
                        />
                        {/* Progress bar */}
                        <div className="h-1 rounded-full bg-surface-container-high overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ease-out ${
                                    wordCount >= MIN_WORDS
                                        ? "bg-secondary"
                                        : wordCount > MIN_WORDS * 0.5
                                        ? "bg-tertiary-fixed-dim"
                                        : "bg-error"
                                }`}
                                style={{ width: `${wordProgress}%` }}
                            />
                        </div>
                        {errors.subject && (
                            <span className="text-body-sm text-error ml-1">{errors.subject}</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant/30">
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={isSubmitting}
                        id="contract-submit-btn"
                    >
                        <span className="material-symbols-outlined text-sm mr-1">picture_as_pdf</span>
                        Guardar y Generar PDF
                    </Button>
                </div>
            </form>
        </div>
    );
}
