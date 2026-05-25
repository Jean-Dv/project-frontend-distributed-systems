// ─── Status enum ────────────────────────────────────────────────────────────

export type ContractStatus =
    | "in_preparation"
    | "published"
    | "awarded"
    | "in_execution"
    | "finalized"
    | "cancelled";

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
    in_preparation: "En preparación",
    published: "Publicado",
    awarded: "Adjudicado",
    in_execution: "En ejecución",
    finalized: "Finalizado",
    cancelled: "Cancelado",
};

export const CONTRACT_STATUS_OPTIONS: { value: ContractStatus; label: string }[] = (
    Object.entries(CONTRACT_STATUS_LABELS) as [ContractStatus, string][]
).map(([value, label]) => ({ value, label }));

// ─── Domain types ────────────────────────────────────────────────────────────

export interface Contract {
    id: string;
    contractNumber?: string;
    status: ContractStatus;
    supplierId: string;
    supplierName?: string;
    subject: string;
    startDate: string; // ISO date "YYYY-MM-DD"
    endDate: string;
    budget: number;
    version?: string;
}

export interface Supplier {
    id: string;
    name: string;
    nit?: string;
    isActive: boolean;
}

// ─── Payloads ────────────────────────────────────────────────────────────────

export interface ContractCreatePayload {
    supplierId: string;
    subject: string;
    startDate: string;
    endDate: string;
    budget: number;
}

export interface ContractEditPayload {
    budget: number;
    status: ContractStatus;
}

// ─── Validation error shapes ─────────────────────────────────────────────────

export interface ContractFormErrors {
    supplierId?: string;
    subject?: string;
    startDate?: string;
    endDate?: string;
    budget?: string;
}

export interface ContractEditErrors {
    budget?: string;
    status?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

const MIN_SUBJECT_WORDS = 200;

export function validateContractCreate(
    payload: Partial<ContractCreatePayload>
): ContractFormErrors {
    const errors: ContractFormErrors = {};

    if (!payload.supplierId) {
        errors.supplierId = "Seleccione un proveedor habilitado.";
    }

    const budget = Number(payload.budget);
    if (!payload.budget || isNaN(budget) || budget <= 0) {
        errors.budget = "El presupuesto debe ser un número mayor a 0.";
    }

    if (!payload.startDate) {
        errors.startDate = "La fecha de inicio es requerida.";
    }

    if (!payload.endDate) {
        errors.endDate = "La fecha de fin es requerida.";
    } else if (payload.startDate && payload.endDate <= payload.startDate) {
        errors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio.";
    }

    if (!payload.subject || payload.subject.trim() === "") {
        errors.subject = "El objeto del contrato es requerido.";
    } else {
        const words = countWords(payload.subject);
        if (words < MIN_SUBJECT_WORDS) {
            errors.subject = `Mínimo ${MIN_SUBJECT_WORDS} palabras (actual: ${words}).`;
        }
    }

    return errors;
}

export function validateContractEdit(
    payload: Partial<ContractEditPayload>
): ContractEditErrors {
    const errors: ContractEditErrors = {};

    if (!payload.status) {
        errors.status = "Seleccione un estado válido.";
    }

    const budget = Number(payload.budget);
    if (!payload.budget || isNaN(budget) || budget <= 0) {
        errors.budget = "El presupuesto debe ser un número mayor a 0.";
    }

    return errors;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

export function countWords(text: string): number {
    if (!text || text.trim() === "") return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export const MIN_WORDS = MIN_SUBJECT_WORDS;

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(dateStr: string): string {
    if (!dateStr) return "—";
    try {
        // Append time to avoid UTC-offset day-shift issues
        return new Date(`${dateStr}T00:00:00`).toLocaleDateString("es-CL");
    } catch {
        return dateStr;
    }
}
