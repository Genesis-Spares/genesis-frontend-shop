import type { MetadataRoute } from "next";

/** Web app manifest (served at /manifest.webmanifest): makes the shop installable on phones. */
export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "Genesis Investment — Car Spare Parts",
        short_name: "Genesis",
        description: "Genuine & OEM car spare parts delivered across Kenya.",
        start_url: "/?source=pwa",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#14161c", // carbon: matches the top bar, so the installed app's status bar blends in
        categories: ["shopping", "auto"],
        lang: "en-KE",
        icons: [
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
            { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
            { name: "Shop parts", url: "/shop", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
            { name: "My cart", url: "/cart", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
            { name: "My orders", url: "/account/orders", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
        ],
    };
}
