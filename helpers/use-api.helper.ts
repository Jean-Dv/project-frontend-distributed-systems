"use client";

import { clearAuthSession, getToken, setAuthMessage } from "@/helpers/auth.helper";

type ErrorPayload = {
    message?: string;
    error?: string;
};

const STATUS_MESSAGES: Record<number, string> = {
    400: "La solicitud no es valida. Revisa los datos enviados.",
    401: "Tu sesion expiro. Inicia sesion nuevamente.",
    403: "No tienes permisos para realizar esta accion.",
    404: "No se encontro el recurso solicitado.",
    409: "No se pudo completar la solicitud por un conflicto.",
    422: "No fue posible procesar los datos enviados.",
    500: "Ocurrio un error en el servidor. Intenta mas tarde.",
    502: "El servidor no esta disponible temporalmente.",
    503: "El servicio no esta disponible en este momento.",
};

export async function getErrorMessage(response: Response): Promise<string> {
    let backendMessage = "";
    try {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            const data = (await response.json()) as ErrorPayload;
            backendMessage = data?.message || data?.error || "";
        } else {
            const text = await response.text();
            backendMessage = text.trim();
        }
    } catch {
        backendMessage = "";
    }

    return backendMessage || STATUS_MESSAGES[response.status] || "Ocurrio un error inesperado.";
}

export function useApi() {
    const apiFetch = async (url: string, options: any = {}) => {
        const token = getToken();
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (response.status === 401) {
            const message = await getErrorMessage(response);
            clearAuthSession();
            setAuthMessage(message);
            window.location.assign("/auth/login");
        }

        return response;
    };

    return { apiFetch };
}