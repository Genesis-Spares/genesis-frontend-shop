import Link from "next/link";
import {
    ShieldCheck,
    Truck,
    Users,
    Wrench,
    PackageCheck,
    HeartHandshake,
    ArrowRight,
} from "lucide-react";
import Topbar from "@/components/common/Topbar";
import MainHeader from "@/components/common/MainHeader";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import PageHero from "@/components/common/PageHero";

const stats = [
    { v: "12+", k: "Years in business" },
    { v: "120,000+", k: "Parts catalogued" },
    { v: "18,500+", k: "Orders delivered" },
    { v: "340+", k: "Partner garages" },
];

const facts: [string, string][] = [
    ["Founded", "2014"],
    ["Headquarters", "Industrial Area, Nairobi"],
    ["Coverage", "All 47 counties"],
    ["Team", "60+ specialists"],
    ["Sourcing", "Genuine & OEM only"],
];

const values = [
    { icon: ShieldCheck, title: "Genuine, always", desc: "Every part is traceable to its manufacturer. No grey imports, no counterfeits — ever." },
    { icon: PackageCheck, title: "Fit guaranteed", desc: "We verify compatibility by make, model and engine before a part leaves the shelf." },
    { icon: Truck, title: "Move fast", desc: "Same-day dispatch across Nairobi and 2–3 day courier to the rest of the country." },
    { icon: HeartHandshake, title: "Trade first", desc: "Garages and fleets get dedicated pricing, credit terms and a named account manager." },
];

const milestones = [
    { year: "2014", title: "Opened the doors", desc: "A single counter in Industrial Area supplying brake and filter parts." },
    { year: "2017", title: "Went digital", desc: "Launched online ordering with make-and-model fitment search." },
    { year: "2020", title: "Nationwide courier", desc: "Partnered with G4S and Wells Fargo to reach every county." },
    { year: "2024", title: "Trade platform", desc: "Dedicated accounts, credit terms and API ordering for fleets." },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Topbar />
            <MainHeader />
            <NavBar activeTab="About Us" />

            <PageHero
                eyebrow="Our story"
                crumb="About Us"
                title={<>The parts counter Kenya <span className="text-brand">actually trusts.</span></>}
                subtitle="Genesis Investment keeps Kenya's vehicles moving — genuine and OEM spare parts, verified for fit and delivered fast, backed by people who know the difference between a part number and a guess."
            />

            {/* stats strip straddling the hero */}
            <div className="border-b border-line bg-white">
                <div className="mx-auto -mt-10 max-w-[1400px] px-4 sm:px-6">
                    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-hairline bg-white shadow-[0_1px_2px_rgba(20,22,28,.04),0_18px_34px_-20px_rgba(20,22,28,.22)] md:grid-cols-4">
                        {stats.map((s, i) => (
                            <div key={s.k} className={`p-6 md:p-7 ${i < stats.length - 1 ? "border-b border-line md:border-b-0 md:border-r" : ""} ${i === 1 ? "border-l border-line md:border-l-0" : ""} ${i === 3 ? "border-l border-line md:border-l-0" : ""}`}>
                                <div className="font-display text-3xl font-extrabold tracking-[-0.02em] text-carbon tnum">{s.v}</div>
                                <div className="mt-1 text-[13px] text-faint">{s.k}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* story + spec sheet */}
            <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
                    <div>
                        <span className="eyebrow">Who we are</span>
                        <h2 className="font-display mt-2 text-[30px] font-extrabold tracking-[-0.02em] text-carbon">
                            Built by mechanics, run like a logistics company
                        </h2>
                        <div className="mt-6 space-y-5 text-[15px] leading-[1.75] text-mutedink">
                            <p>
                                Genesis Investment started in 2014 as a single parts counter in Nairobi&apos;s Industrial
                                Area. The problem we set out to solve is the same one we obsess over today: a driver or a
                                garage should never have to gamble on whether a part is genuine, or whether it will
                                actually fit.
                            </p>
                            <p>
                                So we built the business backwards from that promise. Every SKU is sourced directly from the
                                manufacturer or an authorised distributor. Every listing carries verified fitment data. And
                                every order is picked, checked and dispatched by people who&apos;ve turned a spanner
                                themselves — not a warehouse that&apos;s never seen the underside of a car.
                            </p>
                            <p>
                                Twelve years on, we supply hundreds of garages and fleets across all 47 counties, but the
                                counter mentality hasn&apos;t changed: know the part, know the car, get it there fast.
                            </p>
                        </div>
                        <Link href="/services" className="mt-7 inline-flex items-center gap-2 font-semibold text-brand-ink hover:gap-3 transition-all">
                            See what we do <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="h-fit rounded-2xl border border-hairline bg-surface p-6">
                        <div className="flex items-center gap-2">
                            <Wrench size={16} className="text-brand" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-ink">Company at a glance</span>
                        </div>
                        <div className="mt-4">
                            {facts.map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between border-b border-line py-3.5 text-sm last:border-b-0">
                                    <span className="text-faint">{k}</span>
                                    <span className="font-semibold text-carbon">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* values */}
            <section className="border-y border-line bg-surface">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16">
                    <div className="max-w-2xl">
                        <span className="eyebrow">What we stand for</span>
                        <h2 className="font-display mt-2 text-[30px] font-extrabold tracking-[-0.02em] text-carbon">
                            Four commitments we don&apos;t bend on
                        </h2>
                    </div>
                    <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {values.map((v) => (
                            <div key={v.title} className="rounded-2xl border border-hairline bg-white p-6 transition hover:-translate-y-[3px] hover:shadow-[0_1px_2px_rgba(20,22,28,.04),0_18px_34px_-20px_rgba(20,22,28,.22)]">
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-wash">
                                    <v.icon size={22} className="text-brand" />
                                </span>
                                <h3 className="mt-4 font-semibold text-carbon">{v.title}</h3>
                                <p className="mt-1.5 text-[13.5px] leading-relaxed text-faint">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* milestones */}
            <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16">
                <div className="max-w-2xl">
                    <span className="eyebrow">The road so far</span>
                    <h2 className="font-display mt-2 text-[30px] font-extrabold tracking-[-0.02em] text-carbon">Milestones</h2>
                </div>
                <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-4">
                    {milestones.map((m, i) => (
                        <div key={m.year} className="relative rounded-2xl border border-hairline p-6">
                            <div className="font-mono text-sm font-semibold text-brand-ink tnum">{m.year}</div>
                            <div className="mt-3 h-0.5 w-full bg-line">
                                <div className="h-0.5 w-8 bg-brand" />
                            </div>
                            <h3 className="mt-4 font-semibold text-carbon">{m.title}</h3>
                            <p className="mt-1.5 text-[13.5px] leading-relaxed text-faint">{m.desc}</p>
                            <span className="absolute right-5 top-5 font-display text-2xl font-extrabold text-line-strong">0{i + 1}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA band */}
            <section className="bg-carbon">
                <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-4 sm:px-6 py-14 md:flex-row md:items-center">
                    <div>
                        <h2 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-white">
                            Need a part today? We probably have it on the shelf.
                        </h2>
                        <p className="mt-2 text-[#9ba3af]">Search 120,000+ verified parts or talk to a specialist.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/shop" className="rounded-xl bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-brand-hover">
                            Browse parts
                        </Link>
                        <Link href="/contact-us" className="rounded-xl border border-white/25 px-6 py-3.5 font-semibold text-white transition hover:border-white/50">
                            Contact us
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
