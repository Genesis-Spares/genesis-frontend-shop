'use client'

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Vehicle } from "@/lib/api";

/**
 * The shopper's selected vehicle ("My vehicle"), kept in this browser only.
 * Backed by localStorage via useSyncExternalStore: no hydration mismatch
 * (the server snapshot is null) and every open tab stays in sync.
 */
const KEY = "genesis_vehicle_v1";
const EVENT = "genesis-vehicle-change";

function read(): string | null {
    try { return localStorage.getItem(KEY); } catch { return null; }
}

function subscribe(cb: () => void) {
    window.addEventListener("storage", cb);
    window.addEventListener(EVENT, cb);
    return () => { window.removeEventListener("storage", cb); window.removeEventListener(EVENT, cb); };
}

export function useVehicle() {
    const raw = useSyncExternalStore(subscribe, read, () => null);

    const vehicle = useMemo<Vehicle | null>(() => {
        if (!raw) return null;
        try {
            const v = JSON.parse(raw) as Vehicle;
            return v?.make && v?.model ? v : null;
        } catch { return null; }
    }, [raw]);

    const setVehicle = useCallback((v: Vehicle | null) => {
        try {
            if (v) localStorage.setItem(KEY, JSON.stringify({ make: v.make, model: v.model, ...(v.year ? { year: v.year } : {}) }));
            else localStorage.removeItem(KEY);
        } catch { /* storage unavailable — selection just won't persist */ }
        window.dispatchEvent(new Event(EVENT));
    }, []);

    return { vehicle, setVehicle };
}

/** /shop URL showing parts that fit a vehicle. */
export const shopUrlFor = (v: Vehicle) => {
    const sp = new URLSearchParams({ make: v.make, model: v.model });
    if (v.year) sp.set("year", String(v.year));
    return `/shop?${sp}`;
};
