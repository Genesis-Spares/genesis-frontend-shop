'use client'

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Factory } from "lucide-react";
import Topbar from "@/components/common/Topbar";
import MainHeader from "@/components/common/MainHeader";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import PageHero from "@/components/common/PageHero";

type Brand = { name: string; cat: string; parts: number; oem?: boolean };

const brands: Brand[] = [
    { name: "Bosch", cat: "Braking", parts: 1840 },
    { name: "Brembo", cat: "Braking", parts: 620 },
    { name: "TRW", cat: "Braking", parts: 910 },
    { name: "NGK", cat: "Engine", parts: 730 },
    { name: "Gates", cat: "Engine", parts: 540 },
    { name: "Exedy", cat: "Engine", parts: 280 },
    { name: "Denso", cat: "Electrical", parts: 1120 },
    { name: "Valeo", cat: "Electrical", parts: 680 },
    { name: "KYB", cat: "Suspension", parts: 760 },
    { name: "Monroe", cat: "Suspension", parts: 430 },
    { name: "Sachs", cat: "Suspension", parts: 390 },
    { name: "Mann-Filter", cat: "Filtration", parts: 610 },
    { name: "Mahle", cat: "Filtration", parts: 520 },
    { name: "Toyota", cat: "OEM", parts: 3200, oem: true },
    { name: "Nissan", cat: "OEM", parts: 2140, oem: true },
    { name: "Isuzu", cat: "OEM", parts: 1460, oem: true },
];

const cats = ["All", "OEM", "Braking", "Engine", "Electrical", "Suspension", "Filtration"];

export default function BrandsPage() {
    const [cat, setCat] = useState("All");
    const list = cat === "All" ? brands : brands.filter((b) => b.cat === cat);

    return (
        <div className="min-h-screen bg-white">
            <Topbar />
            <MainHeader />
            <NavBar activeTab="Brands" />

            <PageHero
                eyebrow="Brands we carry"
                crumb="Brands"
                title={<>The names your mechanic <span className="text-brand">asks for by name.</span></>}
                subtitle="Genuine manufacturer and OEM parts from the brands that build the world's vehicles — sourced through authorised channels, never grey imports."
            />

            {/* featured spotlight */}
            <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-14">
                <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-hairline lg:grid-cols-[1.1fr_1fr]">
                    <div className="flex flex-col justify-center bg-surface p-9 md:p-12">
                        <span className="eyebrow">Featured brand</span>
                        <div className="font-display mt-3 text-5xl font-black tracking-[-0.03em] text-carbon">
                            BOSCH<span className="text-brand">.</span>
                        </div>
                        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-mutedink">
                            The world&apos;s largest automotive supplier and our most-stocked brand — braking,
                            electrical, filtration and diagnostics. If it&apos;s Bosch, we almost certainly have it,
                            and it&apos;s covered by a manufacturer warranty.
                        </p>
                        <Link href="/shop" className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-brand-hover">
                            Shop Bosch parts <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-line">
                        {[
                            ["1,840", "Bosch SKUs in stock"],
                            ["2 yr", "Manufacturer warranty"],
                            ["Same-day", "Nairobi dispatch"],
                            ["100%", "Authorised sourcing"],
                        ].map(([v, k]) => (
                            <div key={k} className="flex flex-col justify-center bg-white p-7">
                                <div className="font-display text-2xl font-extrabold text-carbon tnum">{v}</div>
                                <div className="mt-1 text-[13px] text-faint">{k}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* directory */}
            <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-16">
                <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <span className="eyebrow">Full directory</span>
                        <h2 className="font-display mt-2 text-[28px] font-extrabold tracking-[-0.02em] text-carbon">
                            Browse by category
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {cats.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCat(c)}
                                className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${cat === c
                                    ? "border-brand bg-brand text-white"
                                    : "border-line-strong bg-white text-mutedink hover:border-brand/40 hover:text-carbon"
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {list.map((b) => (
                        <Link
                            key={b.name}
                            href="/shop"
                            className="group flex flex-col rounded-2xl border border-hairline bg-white p-6 transition hover:-translate-y-[3px] hover:border-line-strong hover:shadow-[0_1px_2px_rgba(20,22,28,.04),0_18px_34px_-20px_rgba(20,22,28,.22)]"
                        >
                            <div className="flex h-16 items-center">
                                <span className="font-display text-2xl font-black tracking-[-0.02em] text-carbon transition-colors group-hover:text-brand">
                                    {b.name}
                                </span>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-faint">
                                    {b.oem && <BadgeCheck size={13} className="text-brand" />}
                                    {b.cat}
                                </span>
                                <span className="font-mono text-[12px] text-faint tnum">{b.parts.toLocaleString()}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* trust band */}
            <section className="border-t border-line bg-surface">
                <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-4 sm:px-6 py-12 md:grid-cols-3">
                    {[
                        { icon: ShieldCheck, t: "Genuine & OEM only", d: "Sourced through authorised distributors — every part is traceable." },
                        { icon: Factory, t: "Manufacturer-backed", d: "Warranties honoured directly by the brand, not a middleman." },
                        { icon: BadgeCheck, t: "No grey imports", d: "We never stock counterfeit or unauthorised parallel imports." },
                    ].map((x) => (
                        <div key={x.t} className="flex gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
                                <x.icon size={20} className="text-brand" />
                            </span>
                            <div>
                                <div className="font-semibold text-carbon">{x.t}</div>
                                <div className="mt-1 text-[13px] leading-relaxed text-faint">{x.d}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
