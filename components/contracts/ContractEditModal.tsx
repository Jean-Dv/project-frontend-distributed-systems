"use client";

import { useState, useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { resolveErrorMessage } from "@/helpers/use-api.helper";
import {
    Contract,
    ContractEditErrors,
    ContractEditPayload,
    ContractStatus,
    CONTRACT_STATUS_OPTIONS,
    validateContractEdit,
} from "@/helpers/contracts.helper";

interface ContractEditModalProps {
    contract: Contract | null;
    onClose: () => void;
    onSave: (id: string, payload: ContractEditPayload) => Promise<void>;
}

export function ContractEditModal({ contract, onClose, onSave }: ContractEditModalProps) {
    const [status, setStatus] = useState<ContractStatus | "">("");
    const [budget, setBudget] = useState("");
    const [errors, setErrors] = useState<ContractEditErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync form fields when the contract to edit changes
    useEffect(() => {
        if (contract) {
            setStatus(contract.status);
            setBudget(String(contract.budget));
            setErrors({});
            setFormError(null);
        }
    }, [contract]);

    const clearFieldError = (field: keyof ContractEditErrors) =>
        setErrors((prev) => ({ ...prev, [field]: undefined }));

    const handleSave = async () => {
        const payload: Partial<ContractEditPayload> = {
            status: status as ContractStatus,
            budget: Number(budget),
        };

        const validationErrors = validateContractEdit(payload);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setFormError(null);
        try {
            await onSave(contract!.id, payload as ContractEditPayload);
        } catch (err: unknown) {
            setFormError(resolveErrorMessage(err, "No fue posible actualizar el contrato."));
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Shared input class builder ────────────────────────────────────────────
    const fieldCls = (hasError: boolean) =>
        `w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 text-sm transition-all ${
            hasError
                ? "outline outline-1 outline-error focus:ring-error"
                : "outline outline-1 outline-outline-variant/50 focus:ring-primary"
        }`;

    return (
        <Modal
            isOpen={!!contract}
            onClose={onClose}
            title="Editar Contrato"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        isLoading={isSubmitting}
                        id="contract-edit-save-btn"
                    >
                        <span className="material-symbols-outlined text-sm mr-1">save</span>
                        Guardar cambios
                    </Button>
                </>
            }
        >
            <div className="space-y-5">
                {formError && (
                    <Alert variant="error">{formError}</Alert>
                )}
                {/* Contract summary card */}
                {contract && (
                    <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                        <p className="text-label-caps text-on-surface-variant mb-1">Contrato</p>
                        <p className="text-body-sm text-on-surface font-semibold">
                            {contract.contractNumber ?? contract.id}
                        </p>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">
                            ID Proveedor: {contract.supplierId}
                        </p>
                    </div>
                )}

                {/* Status */}
                <div className="flex flex-col gap-2">
                    <label className={`text-label-caps ${errors.status ? "text-error" : "text-on-surface-variant"}`}>
                        Estado <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            flag
                        </span>
                        <select
                            id="contract-edit-status"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as ContractStatus);
                                clearFieldError("status");
                            }}
                            className={`${fieldCls(!!errors.status)} appearance-none cursor-pointer`}
                        >
                            <option value="">Seleccione un estado</option>
                            {CONTRACT_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.status && (
                        <span className="text-body-sm text-error ml-1">{errors.status}</span>
                    )}
                </div>

                {/* Budget */}
                <div className="flex flex-col gap-2">
                    <label className={`text-label-caps ${errors.budget ? "text-error" : "text-on-surface-variant"}`}>
                        Presupuesto <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
                            payments
                        </span>
                        <input
                            id="contract-edit-budget"
                            type="number"
                            min="0"
                            step="0.01"
                            value={budget}
                            onChange={(e) => {
                                setBudget(e.target.value);
                                clearFieldError("budget");
                            }}
                            placeholder="0.00"
                            className={fieldCls(!!errors.budget)}
                        />
                    </div>
                    {errors.budget && (
                        <span className="text-body-sm text-error ml-1">{errors.budget}</span>
                    )}
                </div>
            </div>
        </Modal>
    );
}
