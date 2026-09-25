'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowRight, Package } from "lucide-react";
import { formatKSh } from "@/libs/utils";
import type { CardProduct } from "@/lib/api";

function pct(was: number, now: number) {
    return was > now ? Math.round(((was - now) / was) * 100) : 0;
}
function pad(n: number) {
    return n.toString().padStart(2, "0");
}

interface Props {
    active?: boolean;
    title?: string;
    endsAt?: string | null;
    deals?: CardProduct[];
}

export default function FlashDeals({ active, title = "Flash Deals", endsAt, deals }: Props) {
    const list = deals ?? [];

    const [left, setLeft] = useState<{ h: number; m: number; s: number } | null>(null);
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            // count down to the admin-set end time, else to local midnight
            const end = endsAt ? new Date(endsAt) : (() => { const d = new Date(now); d.setHours(24, 0, 0, 0); return d; })();
            const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
            setLeft({ h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endsAt]);

    // Admin controls visibility: hidden unless the sale is active and has products.
    if (!active || list.length === 0) return null;

    return (
        <section className="bg-surface">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-12">
                <div className="overflow-hidden rounded-3xl border border-hairline bg-white">
                    <div className="relative flex flex-wrap items-center gap-4 overflow-hidden bg-carbon px-6 py-5">
                        <div
                            className="pointer-events-none absolute inset-0 opacity-70"
                            style={{ background: "radial-gradient(circle at 15% 50%, rgba(228,83,31,0.28), transparent 45%)" }}
                        />
                        <div className="relative flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand">
                                <Zap size={20} className="text-white" fill="currentColor" />
                            </span>
                            <div>
                                <div className="font-display text-xl font-extrabold tracking-[-0.02em] text-white">{title}</div>
                                <div className="text-[12px] text-[#9ba3af]">Prices this low won&apos;t last</div>
                            </div>
                        </div>

                        <div className="relative ml-0 flex items-center gap-2 sm:ml-4">
                            <span className="text-[12px] font-medium text-[#c7cdd7]">Ends in</span>
                            <div className="flex items-center gap-1 font-mono">
                                {(left ? [pad(left.h), pad(left.m), pad(left.s)] : ["--", "--", "--"]).map((v, i) => (
                                    <span key={i} className="flex items-center gap-1">
                                        {i > 0 && <span className="text-brand">:</span>}
                                        <span className="rounded-md bg-white/10 px-2 py-1 text-sm font-bold text-white tnum">{v}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Link href="/special-offers" className="relative ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:gap-2.5 transition-all">
                            View all deals <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
                        {list.map((d) => {
                            const discount = d.comparePrice ? pct(d.comparePrice, d.price) : 0;
                            return (
                                <Link
                                    key={d.id || d.sku}
                                    href={`/products/${d.slug || d.sku}`}
                                    className="group flex flex-col p-4 transition hover:bg-surface"
                                >
                                    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-surface">
                                        {discount > 0 && (
                                            <span className="absolute left-2 top-2 z-10 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                −{discount}%
                                            </span>
                                        )}
                                        {d.image ? (
                                            <Image src={d.image} alt={d.name} fill className="object-contain p-3" />
                                        ) : (
                                            <Package size={48} strokeWidth={1.1} className="text-line-strong" />
                                        )}
                                    </div>
                                    <h3 className="mt-3 line-clamp-2 min-h-[34px] text-[12.5px] font-semibold leading-tight text-[#1b1e25] transition-colors group-hover:text-brand">
                                        {d.name}
                                    </h3>
                                    <div className="mt-1.5 flex items-baseline gap-1.5">
                                        <span className="font-display text-[15px] font-extrabold text-carbon tnum">{formatKSh(d.price)}</span>
                                        {d.comparePrice && d.comparePrice > d.price && (
                                            <span className="font-mono text-[11px] text-faint line-through tnum">{d.comparePrice.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-stock">
                                        <span className="h-1.5 w-1.5 rounded-full bg-stock" /> {d.stock}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
