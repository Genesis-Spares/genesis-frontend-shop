'use client'

import Link from "next/link";
import {
    ArrowRight,
    Disc,
    CircleDot,
    BatteryFull,
    Droplet,
    Filter as FilterIcon,
    MoveVertical,
    Wrench,
    Gauge,
    Tag,
    Timer,
    Copy,
} from "lucide-react";
import Topbar from "@/components/common/Topbar";
import MainHeader from "@/components/common/MainHeader";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import PageHero from "@/components/common/PageHero";
import { formatKSh } from "@/libs/utils";

type Deal = {
    name: string;
    sku: string;
    was: number;
    now: number;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    stock: string;
};

const deals: Deal[] = [
    { name: "Bosch Front Brake Disc Set", sku: "BD-A21", was: 10800, now: 8900, icon: Disc, stock: "In Stock" },
    { name: "TRW Ceramic Brake Pads", sku: "BP-3542", was: 5600, now: 4300, icon: CircleDot, stock: "In Stock" },
    { name: "Exide Car Battery 70Ah", sku: "CB-70", was: 13500, now: 11500, icon: BatteryFull, stock: "Low Stock" },
    { name: "KYB Shock Absorber (pair)", sku: "SA-504", was: 9800, now: 7850, icon: MoveVertical, stock: "In Stock" },
    { name: "Mann Oil Filter", sku: "OF-127", was: 1200, now: 850, icon: FilterIcon, stock: "In Stock" },
    { name: "NGK Iridium Spark Plug x4", sku: "SP-IR4", was: 3200, now: 2400, icon: Wrench, stock: "In Stock" },
    { name: "Total 5W-30 Engine Oil 4L", sku: "EO-534", was: 4200, now: 3350, icon: Droplet, stock: "In Stock" },
    { name: "Bosch Wiper Blade Set", sku: "WB-22", was: 2100, now: 1490, icon: Gauge, stock: "In Stock" },
];

const bundles = [
    { title: "Full brake service kit", parts: "Discs + pads + fluid", was: 18900, now: 14900, save: 4000 },
    { title: "Major service bundle", parts: "Oil + 3 filters + plugs", was: 9800, now: 7600, save: 2200 },
    { title: "Suspension refresh", parts: "Shocks + top mounts (pair)", was: 16400, now: 12900, save: 3500 },
];

function pct(was: number, now: number) {
    return Math.round(((was - now) / was) * 100);
}

export default function OffersPage() {
    return (
        <div className="min-h-screen bg-white">
            <Topbar />
            <MainHeader />
            <NavBar activeTab="Special Offers" />

            <PageHero
                eyebrow="Deals & bundles"
                crumb="Special Offers"
                title={<>Genuine parts, <span className="text-brand">honest discounts.</span></>}
                subtitle="Real markdowns on the parts people actually buy — no inflated 'was' prices, just genuine stock moving at a genuine saving."
            />

            {/* featured deal */}
            <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-14">
                <div className="relative overflow-hidden rounded-3xl bg-carbon p-9 md:p-14">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-80"
                        style={{ background: "radial-gradient(circle at 78% 40%, rgba(228,83,31,0.28), transparent 55%)" }}
                    />
                    <div className="relative max-w-xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
                            <Timer size={13} /> Deal of the week
                        </span>
                        <h2 className="font-display mt-5 text-4xl font-extrabold tracking-[-0.03em] leading-[1.05] text-white sm:text-5xl">
                            Up to <span className="text-brand">25% off</span> braking systems
                        </h2>
                        <p className="mt-4 text-[#c7cdd7]">
                            Discs, pads, fluid and full kits from Bosch, Brembo and TRW — this week only, while stock lasts.
                        </p>
                        <div className="mt-7 flex flex-wrap items-center gap-4">
                            <Link href="/shop" className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-brand-hover">
                                Shop the deal <ArrowRight size={16} />
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-[#9ba3af]">
                                <Tag size={15} className="text-brand" /> Auto-applied at checkout
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* offer grid */}
            <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-4">
                <div className="mb-6">
                    <span className="eyebrow">This week&apos;s markdowns</span>
                    <h2 className="font-display mt-2 text-[28px] font-extrabold tracking-[-0.02em] text-carbon">On offer now</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {deals.map((d) => {
                        const Icon = d.icon;
                        const inStock = d.stock === "In Stock";
                        return (
                            <div key={d.sku} className="group flex flex-col overflow-hidden rounded-[14px] border border-hairline bg-white transition hover:-translate-y-[3px] hover:border-line-strong hover:shadow-[0_1px_2px_rgba(20,22,28,.04),0_18px_34px_-20px_rgba(20,22,28,.22)]">
                                <div className="relative flex aspect-[4/3] items-center justify-center bg-surface">
                                    <span className="absolute left-2.5 top-2.5 rounded-md bg-brand px-2 py-1 text-[10.5px] font-bold text-white">
                                        −{pct(d.was, d.now)}%
                                    </span>
                                    <Icon size={64} strokeWidth={1.1} className="text-line-strong" />
                                </div>
                                <div className="flex flex-1 flex-col gap-1.5 p-4">
                                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-faint">{d.sku}</p>
                                    <h3 className="line-clamp-1 font-semibold text-[#1b1e25] transition-colors group-hover:text-brand">{d.name}</h3>
                                    <div className="mt-auto flex items-baseline gap-2 pt-1">
                                        <span className="font-display text-xl font-extrabold text-carbon tnum">{formatKSh(d.now)}</span>
                                        <span className="font-mono text-[13px] text-faint line-through tnum">{d.was.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className={`flex items-center gap-1.5 text-[11px] font-medium ${inStock ? "text-stock" : "text-brand-ink"}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-stock" : "bg-brand"}`} /> {d.stock}
                                        </span>
                                        <span className="rounded-md bg-brand-wash px-2 py-0.5 text-[11px] font-bold text-brand-ink tnum">
                                            Save {(d.was - d.now).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* bundles */}
            <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16">
                <div className="mb-6">
                    <span className="eyebrow">Buy together, save more</span>
                    <h2 className="font-display mt-2 text-[28px] font-extrabold tracking-[-0.02em] text-carbon">Bundle deals</h2>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {bundles.map((b) => (
                        <div key={b.title} className="flex flex-col rounded-2xl border border-hairline bg-white p-7">
                            <div className="flex items-center justify-between">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-wash">
                                    <Wrench size={20} className="text-brand" />
                                </span>
                                <span className="rounded-md bg-carbon px-2.5 py-1 text-[11px] font-bold text-white tnum">
                                    Save {formatKSh(b.save)}
                                </span>
                            </div>
                            <h3 className="font-display mt-5 text-xl font-extrabold tracking-[-0.01em] text-carbon">{b.title}</h3>
                            <p className="mt-1 text-[13.5px] text-faint">{b.parts}</p>
                            <div className="mt-5 flex items-baseline gap-2 border-t border-line pt-5">
                                <span className="font-display text-2xl font-extrabold text-carbon tnum">{formatKSh(b.now)}</span>
                                <span className="font-mono text-sm text-faint line-through tnum">{b.was.toLocaleString()}</span>
                            </div>
                            <Link href="/shop" className="mt-5 flex h-11 items-center justify-center gap-2 rounded-lg bg-brand font-semibold text-white transition hover:bg-brand-hover">
                                Add bundle
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* coupon band */}
            <section className="border-t border-line bg-surface">
                <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-4 sm:px-6 py-12 md:flex-row md:items-center">
                    <div>
                        <span className="eyebrow">First order?</span>
                        <h2 className="font-display mt-2 text-[24px] font-extrabold tracking-[-0.02em] text-carbon">
                            Take an extra 10% off your first purchase
                        </h2>
                        <p className="mt-1 text-sm text-faint">Use this code at checkout — valid for new customers.</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-brand/50 bg-brand-wash px-6 py-4">
                        <span className="font-mono text-xl font-bold tracking-[0.15em] text-brand-ink">GENESIS10</span>
                        <Copy size={16} className="text-brand" />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
