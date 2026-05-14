"use client";

import { clearAuthSession, getToken, setAuthMessage } from "@/helpers/auth.helper";

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
            clearAuthSession();
            setAuthMessage("Tu sesion expiro. Inicia sesion nuevamente.");
            window.location.assign("/auth/login");
        }

        return response;
    };

    return { apiFetch };
}