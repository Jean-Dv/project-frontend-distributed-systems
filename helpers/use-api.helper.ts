"use client";


export function useApi() {
    const token = sessionStorage.getItem("access_token") || "";

    const apiFetch = (url: string, options: any = {}) => {
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            },
        });
    }

    return { apiFetch}
}