"use client";

import { getApiBaseUrl } from "@/helpers/use-api.helper";
import nextConfig from "@/next.config";

export interface AuditEvent {
    timestamp: string;
    serviceOrigin: string;
    action: string;
    data: Record<string, unknown>;
}

export interface AuditPaginatedResponse {
    total: number;
    from: number;
    size: number;
    results: AuditEvent[];
}

export interface AuditFilters {
    contractId?: string;
    action?: string;
    serviceOrigin?: string;
    from?: number;
    size?: number;
}

const BASE_URL = nextConfig.env!.API_BASE_URL;

export async function fetchAuditEvents(
    filters: AuditFilters = {}
): Promise<AuditPaginatedResponse> {
    const query = new URLSearchParams();

    if (filters.contractId) query.set("contractId", filters.contractId);
    if (filters.action) query.set("action", filters.action);
    if (filters.serviceOrigin)
        query.set("serviceOrigin", filters.serviceOrigin);
    if (filters.from !== undefined) query.set("from", String(filters.from));
    if (filters.size !== undefined) query.set("size", String(filters.size));

    const url = `${BASE_URL}/ms-audit/audit?${query.toString()}`;

    // Note: we use raw fetch here, not apiFetch, because this service
    // might be used outside React components. The caller should ensure
    // the Authorization header is present if needed.
    const response = await fetch(url, {
        headers: {},
        credentials: "omit",
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Error al obtener eventos de auditoría: ${response.status} ${text}`
        );
    }

    return response.json();
}
