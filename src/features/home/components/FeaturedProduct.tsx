'use client'

import { ArrowRight, BatteryFull, Disc, FilterIcon, MoveVertical, Wrench } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";


export default function FeaturedProducts({ products }: { products?: any[] }) {
    const list = products ?? [];
    if (!list.length) return null;
    return (
        <div className="bg-surface">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <span className="eyebrow">Handpicked for you</span>
                        <h2 className="font-display text-[27px] font-extrabold tracking-[-0.02em] text-carbon mt-1">
                            Featured Products
                        </h2>
                    </div>
                    <a href="/shop" className="text-[13.5px] text-brand-ink font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                        View All Products <ArrowRight size={14} />
                    </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {list.map((p) => (
                        <ProductCard key={p.sku} product={p} />
                    ))}
                </div>
            </div>
        </div>
    );
}
