import Link from "next/link";
import {
    Search,
    Wrench,
    Truck,
    Gauge,
    ShieldCheck,
    Building2,
    ArrowRight,
    Check,
} from "lucide-react";
import Topbar from "@/components/common/Topbar";
import MainHeader from "@/components/common/MainHeader";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import PageHero from "@/components/common/PageHero";

const services = [
    {
        icon: Search,
        title: "Parts sourcing",
        desc: "Can't find it on the shelf? We source genuine and OEM parts directly from manufacturers and authorised distributors.",
        points: ["Make & model fitment check", "Genuine / OEM options quoted", "ETA before you commit"],
    },
    {
        icon: Wrench,
        title: "Fitting & installation",
        desc: "Book professional fitment at one of our 340+ partner garages across the country — booked when you order.",
        points: ["Vetted partner garages", "Warranty-safe installation", "Nairobi same-day slots"],
    },
    {
        icon: Truck,
        title: "Delivery & dispatch",
        desc: "Same-day rider dispatch in Nairobi and 2–3 day nationwide courier through G4S and Wells Fargo.",
        points: ["Order before 2pm ships today", "Live tracking", "Free delivery over KSh 10,000"],
    },
    {
        icon: Gauge,
        title: "Diagnostics support",
        desc: "Not sure what failed? Send us the symptom or the fault code and we'll help you identify the right part.",
        points: ["Fault-code lookup", "Symptom-to-part guidance", "Talk to a real mechanic"],
    },
    {
        icon: ShieldCheck,
        title: "Warranty & returns",
        desc: "Manufacturer-backed warranties and a straightforward 7-day returns policy on unfitted parts.",
        points: ["Up to 2-year warranties", "7-day returns", "No-quibble on wrong fit"],
    },
    {
        icon: Building2,
        title: "Fleet & trade accounts",
        desc: "Dedicated pricing, credit terms and a named account manager for garages, dealers and fleet operators.",
        points: ["Trade pricing tiers", "30-day credit terms", "Bulk & API ordering"],
    },
];

const steps = [
    { n: "01", title: "Search or ask", desc: "Find the part by make and model, or send us the reg number and fault." },
    { n: "02", title: "We verify fit", desc: "Every part is checked for compatibility before it's confirmed." },
    { n: "03", title: "Dispatch", desc: "Picked, checked and shipped — same-day in Nairobi, courier nationwide." },
    { n: "04", title: "Fit & drive", desc: "Fit it yourself or book a partner garage at checkout. Warranty included." },
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-white">
            <Topbar />
            <MainHeader />
            <NavBar activeTab="Services" />

            <PageHero
                eyebrow="What we do"
                crumb="Services"
                title={<>More than a parts shop — a <span className="text-brand">full supply partner.</span></>}
                subtitle="From sourcing a hard-to-find component to fitting it at a garage near you, Genesis handles the whole chain so your vehicle spends less time off the road."
            />

            {/* services grid */}
            <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((s) => (
                        <div key={s.title} className="group flex flex-col rounded-2xl border border-hairline bg-white p-7 transition hover:-translate-y-[3px] hover:border-line-strong hover:shadow-[0_1px_2px_rgba(20,22,28,.04),0_18px_34px_-20px_rgba(20,22,28,.22)]">
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-carbon transition-colors group-hover:bg-brand">
                                <s.icon size={22} className="text-brand transition-colors group-hover:text-white" />
                            </span>
                            <h3 className="font-display mt-5 text-xl font-extrabold tracking-[-0.01em] text-carbon">{s.title}</h3>
                            <p className="mt-2 text-[14px] leading-relaxed text-mutedink">{s.desc}</p>
                            <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
                                {s.points.map((p) => (
                                    <li key={p} className="flex items-center gap-2.5 text-[13.5px] text-[#3d4552]">
                                        <Check size={15} className="shrink-0 text-brand" strokeWidth={2.5} />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* how it works */}
            <section className="border-y border-line bg-surface">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16">
                    <div className="max-w-2xl">
                        <span className="eyebrow">How it works</span>
                        <h2 className="font-display mt-2 text-[30px] font-extrabold tracking-[-0.02em] text-carbon">
                            From search to fitted in four steps
                        </h2>
                    </div>
                    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-4">
                        {steps.map((s, i) => (
                            <div key={s.n} className="relative">
                                <div className="font-display text-4xl font-extrabold text-brand tnum">{s.n}</div>
                                {i < steps.length - 1 && (
                                    <div className="absolute right-0 top-5 hidden h-0.5 w-1/2 bg-line-strong md:block" />
                                )}
                                <h3 className="mt-3 font-semibold text-carbon">{s.title}</h3>
                                <p className="mt-1.5 text-[13.5px] leading-relaxed text-faint">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* trade accounts split */}
            <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16">
                <div className="overflow-hidden rounded-3xl border border-hairline">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="relative overflow-hidden bg-carbon p-9 md:p-12">
                            <div
                                className="pointer-events-none absolute inset-0 opacity-70"
                                style={{ background: "radial-gradient(circle at 30% 30%, rgba(228,83,31,0.22), transparent 55%)" }}
                            />
                            <div className="relative">
                                <span className="eyebrow text-brand">For garages & fleets</span>
                                <h2 className="font-display mt-2 text-[28px] font-extrabold tracking-[-0.02em] text-white">
                                    Open a trade account
                                </h2>
                                <p className="mt-3 max-w-md text-[#c7cdd7]">
                                    Priority stock, trade pricing and 30-day credit terms for businesses that can&apos;t
                                    afford downtime. One account manager, one number, no runaround.
                                </p>
                                <Link href="/contact-us" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-brand-hover">
                                    Apply for trade <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-px bg-line">
                            {[
                                ["Trade pricing", "Tiered discounts by volume"],
                                ["Credit terms", "Up to 30 days"],
                                ["Priority stock", "Held for your account"],
                                ["Bulk & API", "Order at scale"],
                            ].map(([t, d]) => (
                                <div key={t} className="bg-white p-7">
                                    <div className="font-semibold text-carbon">{t}</div>
                                    <div className="mt-1 text-[13px] text-faint">{d}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
