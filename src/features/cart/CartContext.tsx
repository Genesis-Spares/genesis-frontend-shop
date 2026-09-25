'use client'

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
    useRef,
} from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { getToken } from "@/features/auth/token";
import { cartApi, type ServerCart } from "@/lib/api";

export interface CartItem {
    id: string;
    sku: string;
    slug: string;
    name: string;
    brand?: string;
    price: number;
    image?: string;
    qty: number;
    /** Stock on hand when last seen — caps the quantity. Checkout re-checks on the server. */
    maxQty?: number;
}

const cap = (qty: number, max?: number) => Math.max(1, max !== undefined ? Math.min(qty, Math.max(1, max)) : qty);

interface CartContextValue {
    items: CartItem[];
    count: number;
    subtotal: number;
    ready: boolean;
    add: (item: Omit<CartItem, "qty">, qty?: number) => void;
    remove: (id: string) => void;
    setQty: (id: string, qty: number) => void;
    clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "genesis_cart_v1";
const SYNC_DELAY_MS = 600;

const fromServer = (c: ServerCart): CartItem[] =>
    c.items
        .filter((i) => i.product.isActive)
        .map((i) => ({
            id: i.productId,
            sku: i.product.sku,
            slug: i.product.slug,
            name: i.product.name,
            brand: i.product.brand ?? undefined,
            price: i.unitPrice,
            image: i.product.image ?? undefined,
            qty: cap(i.quantity, i.product.stockQty),
            maxQty: i.product.stockQty,
        }));

/** Union by product; when both sides have a line keep the larger quantity (so re-syncing never doubles it). */
const merge = (local: CartItem[], remote: CartItem[]): CartItem[] => {
    const out = new Map(remote.map((i) => [i.id, i]));
    for (const l of local) {
        const r = out.get(l.id);
        out.set(l.id, r ? { ...r, qty: Math.max(r.qty, l.qty) } : l);
    }
    return [...out.values()];
};

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [ready, setReady] = useState(false);

    // hydrate from localStorage once on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setItems(JSON.parse(raw));
        } catch {
            /* ignore */
        }
        setReady(true);
    }, []);

    // persist on change (after hydration)
    useEffect(() => {
        if (!ready) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            /* ignore */
        }
    }, [items, ready]);

    // ── server sync for signed-in shoppers (lets admins see carts) ──
    const { user, ready: authReady } = useAuth();
    const userId = user?.sub ?? user?.id ?? null;
    const syncedFor = useRef<string | null>(null); // user whose server cart has been merged in
    const prevUser = useRef<string | null>(null);

    // on sign-in: merge the browser cart with the saved one, then save the result
    useEffect(() => {
        if (!ready || !authReady) return;
        if (!userId) {
            // signed out after being signed in → don't leave their cart on a shared device
            if (prevUser.current) setItems([]);
            prevUser.current = null;
            syncedFor.current = null;
            return;
        }
        prevUser.current = userId;
        if (syncedFor.current === userId) return;
        const token = getToken();
        if (!token) return;
        let live = true;
        cartApi.get(token)
            .then((remote) => {
                if (!live) return;
                syncedFor.current = userId;
                setItems((local) => merge(local, fromServer(remote)));
            })
            .catch(() => { if (live) syncedFor.current = userId; }); // offline: keep local, still sync later changes
        return () => { live = false; };
    }, [ready, authReady, userId]);

    // after the merge, push every change (debounced) — PUT replaces the whole cart
    useEffect(() => {
        if (!userId || syncedFor.current !== userId) return;
        const token = getToken();
        if (!token) return;
        const t = setTimeout(() => {
            cartApi.replace(token, items.map((i) => ({ productId: i.id, quantity: Math.min(99, i.qty) }))).catch(() => undefined);
        }, SYNC_DELAY_MS);
        return () => clearTimeout(t);
    }, [items, userId]);

    const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
        setItems((cur) => {
            const i = cur.findIndex((x) => x.id === item.id);
            if (i >= 0) {
                const next = [...cur];
                const maxQty = item.maxQty ?? next[i].maxQty;
                next[i] = { ...next[i], maxQty, qty: cap(next[i].qty + qty, maxQty) };
                return next;
            }
            return [...cur, { ...item, qty: cap(qty, item.maxQty) }];
        });
    }, []);

    const remove = useCallback((id: string) => {
        setItems((cur) => cur.filter((x) => x.id !== id));
    }, []);

    const setQty = useCallback((id: string, qty: number) => {
        setItems((cur) =>
            cur.map((x) => (x.id === id ? { ...x, qty: cap(qty, x.maxQty) } : x)),
        );
    }, []);

    const clear = useCallback(() => setItems([]), []);

    const value = useMemo<CartContextValue>(() => {
        const count = items.reduce((s, x) => s + x.qty, 0);
        const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
        return { items, count, subtotal, ready, add, remove, setQty, clear };
    }, [items, ready, add, remove, setQty, clear]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within <CartProvider>");
    return ctx;
}
