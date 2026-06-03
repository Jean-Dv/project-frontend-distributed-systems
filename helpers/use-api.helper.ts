"use client";

import { clearAuthSession, getToken, setAuthMessage } from "@/helpers/auth.helper";

export type ApiErrorKind =
    | "network"
    | "unauthorized"
    | "forbidden"
    | "validation"
    | "not_found"
    | "conflict"
    | "service_unavailable"
    | "unknown";

export class ApiError extends Error {
    status: number;
    kind: ApiErrorKind;

    constructor(message: string, status: number, kind: ApiErrorKind = "unknown") {
        super(message);
        this.status = status;
        this.kind = kind;
    }
}

export function useApi() {
    const apiFetch = async (url: string, options: RequestInit = {}) => {
        const token = getToken();
        const targetUrl = buildApiUrl(url);

        let response: Response;
        try {
            response = await fetch(targetUrl, {
                ...options,
                headers: {
                    ...options.headers,
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
        } catch {
            throw new ApiError(
                "No se pudo conectar con el servicio. Verifica tu conexión e intenta nuevamente.",
                0,
                "network",
            );
        }

        if (response.status === 401) {
            clearAuthSession();
            setAuthMessage("Tu sesion expiro. Inicia sesion nuevamente.");
            window.location.assign("/auth/login");
            throw new ApiError(
                "Tu sesion expiro. Inicia sesion nuevamente.",
                401,
                "unauthorized",
            );
        }

        if (!response.ok) {
            const { message, kind } = await buildErrorFromResponse(response);
            throw new ApiError(message, response.status, kind);
        }

        return response;
    };

    return { apiFetch };
}

function buildApiUrl(url: string): string {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = getApiBaseUrl();
    if (url.startsWith("/")) return `${baseUrl}${url}`;
    return `${baseUrl}/${url}`;
}

export function getApiBaseUrl(): string {
    return (
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.API_BASE_URL ||
        "http://localhost:8080"
    );
}

async function buildErrorFromResponse(
    response: Response,
): Promise<{ message: string; kind: ApiErrorKind }> {
    const status = response.status;
    const kind = kindForStatus(status);

    // 5xx: never echo backend body to the user — it may contain stack traces,
    // internal error codes, or HTML error pages.
    if (status >= 500) {
        return { message: genericMessageForKind(kind), kind };
    }

    // 4xx: prefer a clean { message } or { error } field returned as JSON.
    const backendMessage = await safeReadBackendMessage(response);
    if (backendMessage) {
        return { message: backendMessage, kind };
    }

    return { message: genericMessageForKind(kind), kind };
}

async function safeReadBackendMessage(response: Response): Promise<string | null> {
    try {
        const data = await response.clone().json();
        if (data && typeof data === "object") {
            const candidate = pickStringField(data, ["message", "error", "detail"]);
            if (candidate && looksLikeUserMessage(candidate)) {
                return candidate;
            }
        }
    } catch {
        // Body wasn't JSON — fall through. We intentionally do NOT read text()
        // to avoid leaking HTML / stack traces / raw exceptions to the user.
    }
    return null;
}

function pickStringField(obj: Record<string, unknown>, keys: string[]): string | null {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string" && value.trim().length > 0) {
            return value.trim();
        }
    }
    return null;
}

// Reject obviously technical strings so internal details never reach the UI.
function looksLikeUserMessage(text: string): boolean {
    if (text.length > 300) return false;
    if (/<[a-z!/][\s\S]*>/i.test(text)) return false; // HTML
    if (/\b(Exception|Traceback|at\s+\w+\.\w+\()/i.test(text)) return false; // stack traces
    return true;
}

function kindForStatus(status: number): ApiErrorKind {
    if (status === 0) return "network";
    if (status === 401) return "unauthorized";
    if (status === 403) return "forbidden";
    if (status === 404) return "not_found";
    if (status === 409) return "conflict";
    if (status === 400 || status === 422) return "validation";
    if (status >= 500) return "service_unavailable";
    if (status >= 400) return "validation";
    return "unknown";
}

function genericMessageForKind(kind: ApiErrorKind): string {
    switch (kind) {
        case "network":
            return "No se pudo conectar con el servicio. Verifica tu conexión e intenta nuevamente.";
        case "unauthorized":
            return "Tu sesion expiro. Inicia sesion nuevamente.";
        case "forbidden":
            return "No tienes permisos para realizar esta acción.";
        case "not_found":
            return "El recurso solicitado no existe o ya no está disponible.";
        case "conflict":
            return "La operación no se puede completar por un conflicto con datos existentes.";
        case "validation":
            return "La información enviada no es válida. Revisa los campos e intenta nuevamente.";
        case "service_unavailable":
            return "El servicio no está disponible en este momento. Intenta nuevamente más tarde.";
        case "unknown":
        default:
            return "Ocurrió un error inesperado. Intenta nuevamente.";
    }
}

/**
 * Resolve any thrown error into a user-safe message.
 *
 * - For ApiError, returns the backend-provided message when it's a 4xx
 *   validation/not-found/conflict (so users see the specific feedback).
 * - For 5xx / network errors, always returns a generic message so internal
 *   details never leak to the UI.
 * - For unknown errors, returns the provided fallback (also generic).
 */
export function resolveErrorMessage(
    error: unknown,
    fallback = "Ocurrió un error inesperado. Intenta nuevamente.",
): string {
    if (error instanceof ApiError) {
        if (error.kind === "service_unavailable" || error.kind === "network") {
            return genericMessageForKind(error.kind);
        }
        return error.message || genericMessageForKind(error.kind);
    }
    return fallback;
}
