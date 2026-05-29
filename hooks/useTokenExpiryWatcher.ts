"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    clearAuthSession,
    getToken,
    msUntilTokenExpiry,
    setAuthMessage,
} from "@/helpers/auth.helper";

/**
 * DP-90 — Automatically redirects the user to /auth/login when their JWT expires.
 *
 * Mount this hook in any authenticated layout/component. It reads the `exp`
 * claim from the stored token, schedules a single setTimeout for the exact
 * expiry moment (minus a small leeway already applied by msUntilTokenExpiry),
 * and cleans up on unmount.
 */
export function useTokenExpiryWatcher() {
    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const delay = msUntilTokenExpiry(token);

        // Token is already expired (or has no exp claim to watch).
        if (delay === 0) return;

        const timerId = setTimeout(() => {
            clearAuthSession();
            setAuthMessage("Tu sesión expiró. Por favor, inicia sesión de nuevo.");
            router.replace("/auth/login");
        }, delay);

        return () => clearTimeout(timerId);
    }, [router]);
}
