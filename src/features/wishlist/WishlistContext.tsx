'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { wishlistApi, toCard, type CardProduct } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthContext";
import { getToken } from "@/features/auth/token";

interface WishlistContextValue {
    items: CardProduct[];
    ids: Set<string>;
    count: number;
    ready: boolean;
    needsLogin: boolean;
    has: (productId: string) => boolean;
    /** Returns "added" | "removed" | "login" (caller redirects on "login"). */
    toggle: (product: { id: string }) => Promise<"added" | "removed" | "login">;
    remove: (productId: string) => Promise<void>;
    refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { user, ready: authReady } = useAuth();
    const [items, setItems] = useState<CardProduct[]>([]);
    const [ready, setReady] = useState(false);

    const refresh = useCallback(async () => {
        const token = getToken();
        if (!user || !token) {
            setItems([]);
            return;
        }
        try {
            const list = await wishlistApi.get(token);
            setItems(list.map(toCard));
        } catch {
            setItems([]);
        }
    }, [user]);

    useEffect(() => {
        if (!authReady) return;
        refresh().finally(() => setReady(true));
    }, [authReady, refresh]);

    const ids = useMemo(() => new Set(items.map((i) => i.id)), [items]);

    const has = useCallback((productId: string) => ids.has(productId), [ids]);

    const toggle = useCallback(
        async (product: { id: string }): Promise<"added" | "removed" | "login"> => {
            const token = getToken();
            if (!user || !token) return "login";
            if (ids.has(product.id)) {
                // optimistic remove
                setItems((cur) => cur.filter((x) => x.id !== product.id));
                try {
                    await wishlistApi.remove(token, product.id);
                } catch {
                    refresh();
                }
                return "removed";
            }
            try {
                await wishlistApi.add(token, product.id);
                await refresh();
            } catch {
                /* ignore */
            }
            return "added";
        },
        [user, ids, refresh],
    );

    const remove = useCallback(
        async (productId: string) => {
            const token = getToken();
            if (!token) return;
            setItems((cur) => cur.filter((x) => x.id !== productId));
            try {
                await wishlistApi.remove(token, productId);
            } catch {
                refresh();
            }
        },
        [refresh],
    );

    const value = useMemo<WishlistContextValue>(
        () => ({
            items,
            ids,
            count: items.length,
            ready,
            needsLogin: !user,
            has,
            toggle,
            remove,
            refresh,
        }),
        [items, ids, ready, user, has, toggle, remove, refresh],
    );

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within <WishlistProvider>");
    return ctx;
}
