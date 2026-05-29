"use client";

import { clearAuthSession, getToken, setAuthMessage } from "@/helpers/auth.helper";

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export function useApi() {
    const apiFetch = async (url: string, options: any = {}) => {
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
            throw new ApiError("Error de conexion con el servidor.", 0);
        }

        if (response.status === 401) {
            clearAuthSession();
            setAuthMessage("Tu sesion expiro. Inicia sesion nuevamente.");
            window.location.assign("/auth/login");
            throw new ApiError("Tu sesion expiro. Inicia sesion nuevamente.", 401);
        }

        if (!response.ok) {
            const message = await extractErrorMessage(response);
            throw new ApiError(message, response.status);
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

async function extractErrorMessage(response: Response): Promise<string> {
    const fallback = fallbackMessage(response.status);
    try {
        const data = await response.clone().json();
        if (data && typeof data.message === "string" && data.message.trim().length > 0) {
            return data.message;
        }
    } catch {
        // Ignore JSON parsing errors.
    }

    try {
        const text = await response.clone().text();
        if (text && text.trim().length > 0) {
            return text;
        }
    } catch {
        // Ignore text parsing errors.
    }

    return fallback;
}

function fallbackMessage(status: number): string {
    if (status === 403) return "No tienes permisos para realizar esta accion.";
    if (status === 404) return "Recurso no encontrado.";
    if (status >= 400 && status < 500) return "Solicitud invalida.";
    if (status >= 500) return "Ocurrio un error en el servidor. Intenta nuevamente.";
    return "Ocurrio un error inesperado.";
}