"use client";

import { useEffect } from "react";

/** Registers /sw.js in production builds (skipped in `next dev`, where it would fight hot reload). */
export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
        const register = () =>
            navigator.serviceWorker
                .register("/sw.js", { scope: "/", updateViaCache: "none" })
                .catch((err) => console.warn("Service worker registration failed", err));
        if (document.readyState === "complete") register();
        else window.addEventListener("load", register, { once: true });
    }, []);
    return null;
}
