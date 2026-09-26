/*
 * Genesis storefront service worker.
 *
 * Caches only the shop's own static files (hashed JS/CSS chunks, fonts, icons, images
 * in /public) so the installed app opens fast. Never caches pages, API responses, carts
 * or account data: the API is on another origin and is ignored entirely, so prices and
 * stock are always live. With no connection, page loads show a branded offline screen.
 */
const VERSION = "v1";
const STATIC_CACHE = `genesis-shop-static-${VERSION}`;
const MAX_STATIC_ENTRIES = 300;

const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#14161c">
<title>Offline · Genesis Investment</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f6f7f9;
       font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#14161c;padding:24px;box-sizing:border-box}
  .card{max-width:360px;text-align:center}
  .logo{width:64px;height:64px;margin:0 auto 18px;display:block}
  h1{font-size:21px;margin:0 0 6px;font-weight:800} p{color:#5b6070;margin:0 0 22px}
  button{background:#e4531f;color:#fff;border:0;border-radius:10px;padding:12px 20px;font:600 15px system-ui;cursor:pointer}
  button:hover{background:#c0430f}
</style></head><body><div class="card">
<img class="logo" src="/icons/icon-192.png" alt="Genesis">
<h1>You're offline</h1>
<p>We need a connection to show live prices and stock. Check your signal or Wi-Fi and try again. Your cart is saved on this device.</p>
<button onclick="location.reload()">Try again</button>
</div><script>addEventListener('online',()=>location.reload())</script></body></html>`;

self.addEventListener("install", (event) => {
    // pre-cache the icon so the offline page can show the logo
    event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.add("/icons/icon-192.png")).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k.startsWith("genesis-shop-") && k !== STATIC_CACHE).map((k) => caches.delete(k)));
        await self.clients.claim();
    })());
});

const isStatic = (url) =>
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:woff2?|ttf|otf|png|jpe?g|webp|avif|svg|ico)$/.test(url.pathname);

async function trim(cache) {
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - MAX_STATIC_ENTRIES; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return; // API, Cloudinary, maps: straight to network

    if (req.mode === "navigate") {
        event.respondWith(
            fetch(req).catch(() => new Response(OFFLINE_HTML, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } })),
        );
        return;
    }

    if (isStatic(url)) {
        event.respondWith((async () => {
            const cache = await caches.open(STATIC_CACHE);
            const hit = await cache.match(req);
            if (hit) return hit;
            const res = await fetch(req);
            if (res.ok && res.type === "basic") cache.put(req, res.clone()).then(() => trim(cache));
            return res;
        })());
    }
    // everything else (RSC payloads, manifest…): browser default
});
