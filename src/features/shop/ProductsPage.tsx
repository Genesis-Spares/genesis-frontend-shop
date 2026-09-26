"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Topbar from "@/components/common/Topbar";
import MainHeader from "@/components/common/MainHeader";
import NavBar from "@/components/common/NavBar";
import ProductCard from "@/components/common/ProductCard";
import ProductFilters from "./ProductFilters";
import { WhyChooseUs } from "../home";
import ShopHero from "@/components/common/ShopHero";
import Footer from "@/components/common/Footer";
import ShopVehicleBar from "@/features/vehicle/ShopVehicleBar";
import type { ApiCategory, CardProduct } from "@/lib/api";

import { Grid3X3, ChevronRight, ChevronLeft, PackageSearch } from "lucide-react";

const SORT_OPTIONS: { value: string; label: string; sortBy: string; sortOrder: string }[] = [
    { value: "featured", label: "Sort by: Featured", sortBy: "popularity", sortOrder: "desc" },
    { value: "low-high", label: "Price: Low to High", sortBy: "price", sortOrder: "asc" },
    { value: "high-low", label: "Price: High to Low", sortBy: "price", sortOrder: "desc" },
    { value: "newest", label: "Newest", sortBy: "createdAt", sortOrder: "desc" },
    { value: "rating", label: "Top rated", sortBy: "rating", sortOrder: "desc" },
];


interface Props {
    products: CardProduct[];
    meta?: { total: number; page: number; limit: number; totalPages: number };
    categories: ApiCategory[];
    query: {
        search?: string;
        make?: string;
        model?: string;
        year?: number;
        categoryId?: string;
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
        inStock?: boolean;
        sortBy?: string;
        page: number;
    };
}

export default function ProductsPage({ products, meta, categories, query }: Props) {
    const router = useRouter();
    const params = useSearchParams();

    const list = products;

    const setParam = (updates: Record<string, string | undefined>) => {
        const next = new URLSearchParams(params.toString());
        for (const [k, v] of Object.entries(updates)) {
            if (v === undefined || v === "") next.delete(k);
            else next.set(k, v);
        }
        if (!("page" in updates)) next.delete("page"); // reset page on filter/sort change
        router.push(`/shop?${next.toString()}`);
    };

    const currentSort =
        SORT_OPTIONS.find((o) => o.sortBy === query.sortBy)?.value ?? "featured";

    const total = meta?.total ?? list.length;
    const totalPages = meta?.totalPages ?? 1;
    const page = query.page || 1;

    return (
        <div className="min-h-screen bg-white">
            <Topbar />
            <MainHeader />
            <ShopHero />
            <NavBar activeTab="Shop" />

            <main className="mx-auto max-w-[1450px] px-4 py-8 sm:px-6">
                <div className="mb-4 flex items-center gap-2 text-[12.5px] text-faint">
                    <span>Home</span>
                    <ChevronRight size={14} />
                    <span className="text-mutedink">Shop</span>
                </div>

                <ShopVehicleBar
                    active={query.make ? { make: query.make, model: query.model ?? '', year: query.year } : undefined}
                    onClear={() => setParam({ make: undefined, model: undefined, year: undefined })}
                />

                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-extrabold sm:text-3xl tracking-[-0.02em] text-carbon">
                            {query.search ? <>Results for &ldquo;{query.search}&rdquo;</> : "Shop All Parts"}
                        </h1>
                        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-faint">
                            {`Showing ${list.length} of ${total} result${total !== 1 ? "s" : ""}`}
                            {query.search && (
                                <button
                                    type="button"
                                    onClick={() => setParam({ search: undefined })}
                                    className="inline-flex items-center gap-1 rounded-full border border-line-strong px-2.5 py-0.5 text-[12px] font-medium text-mutedink transition hover:border-brand hover:text-brand-ink"
                                >
                                    Clear search ✕
                                </button>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden h-10 w-10 items-center justify-center rounded-lg border border-line-strong text-brand md:flex">
                            <Grid3X3 size={18} />
                        </span>
                        <select
                            value={currentSort}
                            onChange={(e) => {
                                const o = SORT_OPTIONS.find((x) => x.value === e.target.value)!;
                                setParam({ sortBy: o.sortBy, sortOrder: o.sortOrder });
                            }}
                            className="h-11 rounded-lg border border-line-strong bg-white px-3.5 text-sm text-carbon outline-none focus:border-brand"
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr] lg:gap-8">
                    <ProductFilters
                        categories={categories}
                        active={{
                            categoryId: query.categoryId,
                            brand: query.brand,
                            inStock: query.inStock,
                            maxPrice: query.maxPrice,
                        }}
                        onChange={setParam}
                    />

                    <section>
                        {list.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-hairline bg-surface p-16 text-center">
                                <PackageSearch size={32} className="text-line-strong" />
                                <h3 className="font-display mt-4 text-lg font-extrabold text-carbon">No parts found</h3>
                                <p className="mt-1 text-sm text-faint">Try clearing filters or a different search.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
                                {list.map((product) => (
                                    <ProductCard key={product.id || product.sku} product={product} />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setParam({ page: String(Math.max(1, page - 1)) })}
                                    disabled={page <= 1}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-strong text-mutedink disabled:opacity-40"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setParam({ page: String(n) })}
                                        className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold ${n === page
                                            ? "border-brand bg-brand text-white"
                                            : "border-line-strong bg-white text-carbon hover:border-brand/40"
                                            }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setParam({ page: String(Math.min(totalPages, page + 1)) })}
                                    disabled={page >= totalPages}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-strong text-mutedink disabled:opacity-40"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <WhyChooseUs />
            <Footer />
        </div>
    );
}
