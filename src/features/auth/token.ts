/**
 * Shopper auth token storage (client only, localStorage).
 * Shared by AuthContext and any authed API call (wishlist, account).
 */
const AT = "genesis_at";
const RT = "genesis_rt";

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem(AT);
    } catch {
        return null;
    }
}

export function getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem(RT);
    } catch {
        return null;
    }
}

export function setTokens(accessToken: string, refreshToken?: string) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(AT, accessToken);
        if (refreshToken) localStorage.setItem(RT, refreshToken);
    } catch {
        /* ignore */
    }
}

export function clearTokens() {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(AT);
        localStorage.removeItem(RT);
    } catch {
        /* ignore */
    }
}
