// ─── Domain types ────────────────────────────────────────────────────────────

export interface Supplier {
    id: string;
    nit: string;
    name: string;
    legalRepresentative: string;
    email: string;
    phone: string;
    isActive: boolean;
}

// ─── Payloads ────────────────────────────────────────────────────────────────

export interface SupplierCreatePayload {
    nit: string;
    name: string;
    legalRepresentative: string;
    email: string;
    phone: string;
}

// Backend only allows updating name/razón social, phone and status.
export interface SupplierEditPayload {
    name: string;
    phone: string;
    isActive: boolean;
}

// ─── Validation error shapes ─────────────────────────────────────────────────

export interface SupplierCreateErrors {
    nit?: string;
    name?: string;
    legalRepresentative?: string;
    email?: string;
    phone?: string;
}

export interface SupplierEditErrors {
    name?: string;
    phone?: string;
    isActive?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\-()\d\s]{7,20}$/;
const NIT_REGEX = /^[\d-]{5,20}$/;

export function validateSupplierCreate(
    payload: Partial<SupplierCreatePayload>
): SupplierCreateErrors {
    const errors: SupplierCreateErrors = {};

    const nit = (payload.nit ?? "").trim();
    if (!nit) {
        errors.nit = "El NIT es obligatorio.";
    } else if (!NIT_REGEX.test(nit)) {
        errors.nit = "Ingrese un NIT válido (solo dígitos, opcional guion).";
    }

    const name = (payload.name ?? "").trim();
    if (!name) {
        errors.name = "El nombre o razón social es obligatorio.";
    } else if (name.length < 3) {
        errors.name = "El nombre debe tener al menos 3 caracteres.";
    }

    const legalRep = (payload.legalRepresentative ?? "").trim();
    if (!legalRep) {
        errors.legalRepresentative = "El representante legal es obligatorio.";
    } else if (legalRep.length < 3) {
        errors.legalRepresentative = "Ingrese el nombre completo del representante.";
    }

    const email = (payload.email ?? "").trim();
    if (!email) {
        errors.email = "El correo electrónico es obligatorio.";
    } else if (!EMAIL_REGEX.test(email)) {
        errors.email = "Ingrese un correo electrónico válido.";
    }

    const phone = (payload.phone ?? "").trim();
    if (!phone) {
        errors.phone = "El teléfono es obligatorio.";
    } else if (!PHONE_REGEX.test(phone)) {
        errors.phone = "Ingrese un teléfono válido (7 a 20 dígitos).";
    }

    return errors;
}

export function validateSupplierEdit(
    payload: Partial<SupplierEditPayload>
): SupplierEditErrors {
    const errors: SupplierEditErrors = {};

    const name = (payload.name ?? "").trim();
    if (!name) {
        errors.name = "El nombre o razón social es obligatorio.";
    } else if (name.length < 3) {
        errors.name = "El nombre debe tener al menos 3 caracteres.";
    }

    const phone = (payload.phone ?? "").trim();
    if (!phone) {
        errors.phone = "El teléfono es obligatorio.";
    } else if (!PHONE_REGEX.test(phone)) {
        errors.phone = "Ingrese un teléfono válido (7 a 20 dígitos).";
    }

    if (typeof payload.isActive !== "boolean") {
        errors.isActive = "Seleccione un estado válido.";
    }

    return errors;
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export function statusLabel(isActive: boolean): string {
    return isActive ? "HABILITADO" : "INHABILITADO";
}
