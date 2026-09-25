'use client'

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronDown, Loader2, Package, Search, X } from "lucide-react";
import { matchedPartNumber, PART_TYPE_LABEL, storefront, toCard, type ApiCategory, type ApiPartNumber, type CardProduct } from "@/lib/api";
import { formatKSh } from "@/libs/utils";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

/**
 * Header search: submits to /shop?search=…(&categoryId=…) and shows live
 * product suggestions while typing. Keyboard: ↑/↓ to move, Enter to open, Esc to close.
 */
export default function SearchBar({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const listId = useId();

    const urlSearch = pathname === "/shop" ? params.get("search") ?? "" : "";
    const urlCategory = pathname === "/shop" ? params.get("categoryId") ?? "" : "";
    const [q, setQ] = useState(urlSearch);
    const [categoryId, setCategoryId] = useState(urlCategory);

    // follow the URL when it changes underneath us (e.g. "Clear search" on /shop, back button)
    const [seen, setSeen] = useState({ urlSearch, urlCategory });
    if (seen.urlSearch !== urlSearch || seen.urlCategory !== urlCategory) {
        setSeen({ urlSearch, urlCategory });
        setQ(urlSearch);
        setCategoryId(urlCategory);
    }
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [results, setResults] = useState<{ items: (CardProduct & { match?: ApiPartNumber })[]; total: number; for: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1); // -1 = the input; items.length = "see all"
    const wrapRef = useRef<HTMLDivElement>(null);

    // top-level categories for the scope picker (desktop only)
    useEffect(() => {
        if (variant !== "desktop") return;
        storefront.categories().then((c) => setCategories(c.filter((x) => x.isActive && !x.parentId))).catch(() => undefined);
    }, [variant]);

    // debounced suggestions
    const term = q.trim();
    useEffect(() => {
        if (term.length < MIN_CHARS) return;
        let live = true;
        const t = setTimeout(async () => {
            setLoading(true);
            const res = await storefront.listProducts({ search: term, categoryId: categoryId || undefined, limit: 6 });
            if (!live) return;
            setResults({ items: res.items.map((p) => ({ ...toCard(p), match: matchedPartNumber(p, term) })), total: res.meta?.total ?? res.items.length, for: term });
            setActive(-1);
            setLoading(false);
        }, DEBOUNCE_MS);
        return () => { live = false; clearTimeout(t); };
    }, [term, categoryId]);

    // close on outside click
    useEffect(() => {
        const onDown = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    const goToResults = () => {
        const sp = new URLSearchParams();
        if (term) sp.set("search", term);
        if (categoryId) sp.set("categoryId", categoryId);
        setOpen(false);
        router.push(`/shop${sp.toString() ? `?${sp}` : ""}`);
    };

    const goToProduct = (p: CardProduct) => {
        setOpen(false);
        router.push(`/products/${p.slug || p.sku}`);
    };

    const shown = term.length >= MIN_CHARS && results?.for === term ? results : null;
    const items = shown?.items ?? [];

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") { setOpen(false); return; }
        if (!open || !shown) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
        if (e.key === "Enter" && active >= 0 && active < items.length) { e.preventDefault(); goToProduct(items[active]); }
    };

    const panelOpen = open && term.length >= MIN_CHARS && (loading || !!shown);

    return (
        <div ref={wrapRef} className={variant === "desktop" ? "relative hidden max-w-xl flex-1 md:block" : "relative md:hidden"}>
            <form
                role="search"
                onSubmit={(e) => { e.preventDefault(); goToResults(); }}
                className="flex h-12 items-stretch overflow-hidden rounded-xl border border-hairline bg-surface transition focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10"
            >
                {variant === "desktop" && (
                    <label className="relative flex items-center border-r border-hairline">
                        <span className="sr-only">Search in category</span>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="h-full max-w-[150px] cursor-pointer appearance-none truncate bg-transparent pl-4 pr-8 text-[13.5px] font-semibold text-[#3d4552] outline-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 text-faint" />
                    </label>
                )}
                <input
                    type="search"
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder="Search parts, brands, OE or part numbers…"
                    aria-label="Search parts"
                    role="combobox"
                    aria-expanded={panelOpen}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-[#98a0ac] [&::-webkit-search-cancel-button]:hidden"
                />
                {q && (
                    <button type="button" onClick={() => { setQ(""); setResults(null); }} aria-label="Clear search" className="px-2 text-faint hover:text-carbon">
                        <X size={16} />
                    </button>
                )}
                <button type="submit" aria-label="Search" className="flex w-14 shrink-0 items-center justify-center bg-brand transition-colors hover:bg-brand-hover">
                    <Search size={16} className="text-white" />
                </button>
            </form>

            {panelOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-hairline bg-white shadow-[0_18px_40px_-16px_rgba(20,22,28,0.35)]">
                    {loading && !shown ? (
                        <div className="flex items-center gap-2 px-4 py-5 text-sm text-faint"><Loader2 size={16} className="animate-spin" /> Searching…</div>
                    ) : items.length === 0 ? (
                        <div className="px-4 py-5 text-sm">
                            <p className="font-medium text-carbon">No parts match &ldquo;{term}&rdquo;</p>
                            <p className="mt-0.5 text-faint">Try fewer words, a part number, or <a href="/contact-us" className="font-semibold text-brand-ink hover:underline">ask our team</a>.</p>
                        </div>
                    ) : (
                        <>
                            <ul id={listId} role="listbox" className="max-h-[360px] overflow-y-auto py-1.5">
                                {items.map((p, i) => (
                                    <li key={p.id} id={`${listId}-${i}`} role="option" aria-selected={active === i}>
                                        <button
                                            type="button"
                                            onMouseEnter={() => setActive(i)}
                                            onClick={() => goToProduct(p)}
                                            className={`flex w-full items-center gap-3 px-3.5 py-2 text-left transition ${active === i ? "bg-surface" : ""}`}
                                        >
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface">
                                                {p.image
                                                    ? <Image src={p.image} alt="" width={44} height={44} className="h-full w-full object-contain p-1" />
                                                    : <Package size={18} className="text-line-strong" />}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-[13.5px] font-medium text-carbon">{p.name}</span>
                                                {p.match && (
                                                    <span className="block truncate text-[12px] font-medium text-stock">
                                                        Matches {PART_TYPE_LABEL[p.match.type]}{p.match.brand ? ` ${p.match.brand}` : ""} <span className="font-mono">{p.match.number}</span>
                                                    </span>
                                                )}
                                                <span className="block truncate text-[12px] text-faint">
                                                    <span className="font-mono">{p.sku}</span>{p.brand ? ` · ${p.brand}` : ""}
                                                    {p.stock !== "In Stock" && (
                                                        <span className={p.stock === "Out of Stock" ? " text-[#b23b32]" : " text-brand-ink"}> · {p.stock}</span>
                                                    )}
                                                </span>
                                            </span>
                                            <span className="shrink-0 font-mono text-[13px] font-semibold text-carbon">{formatKSh(p.price)}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                onMouseEnter={() => setActive(items.length)}
                                onClick={goToResults}
                                className={`flex w-full items-center justify-between border-t border-hairline px-4 py-3 text-[13px] font-semibold text-brand-ink transition ${active === items.length ? "bg-brand-wash" : "hover:bg-brand-wash"}`}
                            >
                                See all {shown?.total ?? items.length} result{shown?.total === 1 ? "" : "s"} for &ldquo;{term}&rdquo;
                                <ArrowRight size={15} />
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
