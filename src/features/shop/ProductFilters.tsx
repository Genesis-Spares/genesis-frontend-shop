"use client";

import { useEffect, useState } from "react";
import { ChevronUp, SlidersHorizontal, X } from "lucide-react";
import type { ApiCategory } from "@/lib/api";

const BRANDS = ["Bosch", "TRW", "NGK", "Denso", "KYB", "Mann"];

interface Props {
    categories: ApiCategory[];
    active: {
        categoryId?: string;
        brand?: string;
        inStock?: boolean;
        maxPrice?: number;
    };
    onChange: (updates: Record<string, string | undefined>) => void;
}

/**
 * Sidebar on desktop. Below lg it collapses into a "Filters" button that opens a
 * slide-over sheet, so phones see products straight away instead of a long filter list.
 */
export default function ProductFilters(props: Props) {
    const [open, setOpen] = useState(false);
    const { active } = props;
    const count = [active.categoryId, active.brand, active.inStock, active.maxPrice].filter(Boolean).length;

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-line-strong bg-white text-sm font-semibold text-carbon transition hover:border-brand lg:hidden"
            >
                <SlidersHorizontal size={16} /> Filters
                {count > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">{count}</span>
                )}
            </button>

            <div className="hidden lg:block">
                <FilterPanel {...props} />
            </div>

            {open && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
                    <div className="absolute inset-0 bg-carbon/50" onClick={() => setOpen(false)} />
                    <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-line px-5 py-4">
                            <h2 className="font-display text-lg font-extrabold text-carbon">Filters</h2>
                            <button type="button" onClick={() => setOpen(false)} aria-label="Close filters"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-mutedink hover:bg-surface hover:text-carbon">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto overscroll-contain">
                            <FilterPanel {...props} flat />
                        </div>
                        <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                            <button type="button" onClick={() => setOpen(false)}
                                className="h-12 w-full rounded-lg bg-carbon text-sm font-semibold text-white">
                                Show results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function FilterPanel({ categories, active, onChange, flat }: Props & { flat?: boolean }) {
    const [price, setPrice] = useState(active.maxPrice ?? 50000);

    return (
        <aside className={flat ? "" : "h-fit overflow-hidden rounded-2xl border border-hairline bg-white"}>
            <FilterSection title="CATEGORIES">
                {categories.length === 0 && (
                    <p className="text-[13px] text-faint">No categories available.</p>
                )}
                {categories.map((c) => {
                    const on = active.categoryId === c.id;
                    return (
                        <button
                            key={c.id}
                            onClick={() => onChange({ categoryId: on ? undefined : c.id })}
                            className={`flex w-full items-center justify-between text-left text-[13px] ${on ? "font-semibold text-brand-ink" : "text-mutedink hover:text-carbon"
                                }`}
                        >
                            <span className="flex items-center gap-2.5">
                                <span className={`h-[15px] w-[15px] rounded border ${on ? "border-brand bg-brand" : "border-line-strong"}`} />
                                {c.name}
                            </span>
                            {typeof c.productCount === "number" && (
                                <span className="font-mono text-xs text-faint">({c.productCount})</span>
                            )}
                        </button>
                    );
                })}
            </FilterSection>

            <div className="border-t border-line p-5">
                <h4 className="mb-4 text-[13.5px] font-bold text-carbon">PRICE RANGE</h4>
                <input
                    type="range"
                    min={0}
                    max={50000}
                    step={500}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full accent-brand"
                />
                <div className="mt-2 flex justify-between text-[13px] text-faint tnum">
                    <span>KSh 0</span>
                    <span>KSh {price.toLocaleString()}</span>
                </div>
                <button
                    onClick={() => onChange({ maxPrice: price >= 50000 ? undefined : String(price) })}
                    className="mt-4 w-full rounded-lg bg-brand py-3 text-[13.5px] font-semibold text-white transition hover:bg-brand-hover"
                >
                    APPLY FILTER
                </button>
            </div>

            <FilterSection title="BRANDS">
                {BRANDS.map((b) => {
                    const on = active.brand === b;
                    return (
                        <button
                            key={b}
                            onClick={() => onChange({ brand: on ? undefined : b })}
                            className={`flex w-full items-center gap-2.5 text-left text-[13px] ${on ? "font-semibold text-brand-ink" : "text-mutedink hover:text-carbon"
                                }`}
                        >
                            <span className={`h-[15px] w-[15px] rounded border ${on ? "border-brand bg-brand" : "border-line-strong"}`} />
                            {b}
                        </button>
                    );
                })}
            </FilterSection>

            <FilterSection title="AVAILABILITY">
                <button
                    onClick={() => onChange({ inStock: active.inStock ? undefined : "true" })}
                    className={`flex w-full items-center gap-2.5 text-left text-[13px] ${active.inStock ? "font-semibold text-brand-ink" : "text-mutedink hover:text-carbon"
                        }`}
                >
                    <span className={`h-[15px] w-[15px] rounded border ${active.inStock ? "border-brand bg-brand" : "border-line-strong"}`} />
                    In Stock only
                </button>
            </FilterSection>

            {(active.categoryId || active.brand || active.inStock || active.maxPrice) && (
                <div className="border-t border-line p-5">
                    <button
                        onClick={() => onChange({ categoryId: undefined, brand: undefined, inStock: undefined, maxPrice: undefined })}
                        className="text-[13px] font-semibold text-brand-ink hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </aside>
    );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border-b border-line p-5">
            <div className="mb-4 flex items-center justify-between">
                <h4 className="text-[13.5px] font-bold text-carbon">{title}</h4>
                <ChevronUp size={16} className="text-faint" />
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}
