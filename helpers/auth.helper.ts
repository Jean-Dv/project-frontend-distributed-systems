export type UserRole = "ADMIN" | "FUNC" | "AUDITOR";

type AuthSession = {
    token: string;
    scopes?: string[];
    role?: string | null;
};

const ACCESS_TOKEN_KEY = "access_token";
const USER_ROLE_KEY = "user_role";
const USER_SCOPES_KEY = "user_scopes";
const AUTH_MESSAGE_KEY = "auth_message";

export function getToken(): string {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

export function getRole(): UserRole | null {
    const role = sessionStorage.getItem(USER_ROLE_KEY);
    const normalized = normalizeRole(role);
    if (normalized) return normalized;
    return null;
}

export function getScopes(): string[] {
    const raw = sessionStorage.getItem(USER_SCOPES_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function setAuthMessage(message: string) {
    sessionStorage.setItem(AUTH_MESSAGE_KEY, message);
}

export function popAuthMessage(): string | null {
    const message = sessionStorage.getItem(AUTH_MESSAGE_KEY);
    if (message) {
        sessionStorage.removeItem(AUTH_MESSAGE_KEY);
    }
    return message;
}

export function clearAuthSession() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(USER_ROLE_KEY);
    sessionStorage.removeItem(USER_SCOPES_KEY);
}

/**
 * Returns true if the token is missing, malformed, or past its `exp` claim.
 * A 30-second leeway is applied to account for clock skew.
 */
export function isTokenExpired(token?: string): boolean {
    const t = token ?? getToken();
    if (!t) return true;
    const payload = decodeJwtPayload(t);
    if (!payload || typeof payload.exp !== "number") return false; // no exp → treat as non-expiring
    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp - nowSeconds < 30; // 30-second leeway
}

/**
 * Returns the number of milliseconds until the token expires.
 * Returns 0 if already expired or no token/exp claim found.
 */
export function msUntilTokenExpiry(token?: string): number {
    const t = token ?? getToken();
    if (!t) return 0;
    const payload = decodeJwtPayload(t);
    if (!payload || typeof payload.exp !== "number") return 0;
    const remaining = payload.exp * 1000 - Date.now();
    return Math.max(0, remaining);
}

export function setAuthSession({ token, scopes, role }: AuthSession) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    if (scopes && scopes.length > 0) {
        sessionStorage.setItem(USER_SCOPES_KEY, JSON.stringify(scopes));
    } else {
        sessionStorage.removeItem(USER_SCOPES_KEY);
    }

    const inferredRole = inferRole({ role, scopes, token });
    if (inferredRole) {
        sessionStorage.setItem(USER_ROLE_KEY, inferredRole);
    } else {
        sessionStorage.removeItem(USER_ROLE_KEY);
    }
}

export function roleToDashboardPath(role: UserRole | null): string {
    if (role === "ADMIN") return "/dashboard/suppliers";
    if (role === "FUNC") return "/dashboard/contracts";
    if (role === "AUDITOR") return "/dashboard/audit";
    return "/dashboard";
}

function inferRole({ role, scopes, token }: { role?: string | null; scopes?: string[]; token?: string }) {
    const directRole = normalizeRole(role);
    if (directRole) return directRole;

    const tokenPayload = token ? decodeJwtPayload(token) : null;
    const tokenRole = tokenPayload?.role || tokenPayload?.roles;
    if (typeof tokenRole === "string") {
        const normalizedTokenRole = normalizeRole(tokenRole);
        if (normalizedTokenRole) return normalizedTokenRole;
    }
    if (Array.isArray(tokenRole)) {
        const normalized = tokenRole.filter((value) => typeof value === "string");
        if (normalized.includes("ADMIN")) return "ADMIN";
        if (normalized.includes("OFFICER") || normalized.includes("FUNC")) return "FUNC";
        if (normalized.includes("AUDITOR")) return "AUDITOR";
    }

    const normalizedScopes = (scopes || (tokenPayload as { scopes?: string[] } | null)?.scopes || []).map((scope: string) => scope.toLowerCase());
    const hasAudit = normalizedScopes.some((scope: string) => scope.includes("audit"));
    const hasSuppliers = normalizedScopes.some((scope: string) => scope.includes("supplier"));
    const hasContracts = normalizedScopes.some((scope: string) => scope.includes("contract"));

    if (hasAudit && hasSuppliers) return "ADMIN";
    if (hasAudit) return "AUDITOR";
    if (hasSuppliers || hasContracts) return "FUNC";

    return null;
}


function normalizeRole(role?: string | null): UserRole | null {
    if (!role) return null;
    if (role === "ADMIN" || role === "FUNC" || role === "AUDITOR") return role;
    if (role === "OFFICER") return "FUNC";
    return null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    try {
        const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}
