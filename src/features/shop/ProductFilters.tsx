"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
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

export default function ProductFilters({ categories, active, onChange }: Props) {
    const [price, setPrice] = useState(active.maxPrice ?? 50000);

    return (
        <aside className="h-fit overflow-hidden rounded-2xl border border-hairline bg-white">
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
