export interface Supplier {
    id: string;
    nit: string;
    name: string;
    email: string;
    phone: string;
    legalRepresentative: string;
    is_active: boolean;
}

export interface SupplierCreatePayload {
    nit: string;
    name: string;
    email: string;
    phone: string;
    legalRepresentative: string;
}

export interface SupplierEditPayload {
    name?: string;
    email?: string;
    phone?: string;
    legalRepresentative?: string;
    is_active?: boolean;
}

export interface SupplierFormErrors {
    nit?: string;
    name?: string;
    email?: string;
    phone?: string;
    legalRepresentative?: string;
}
