import Link from "next/link";
import { FileText, Mail, Phone } from "lucide-react";
import Topbar from "@/components/common/Topbar";
import MainHeader from "@/components/common/MainHeader";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import PageHero from "@/components/common/PageHero";
import { LEGAL, isPlaceholder } from "@/lib/legal";

export interface LegalSection {
    id: string;
    title: string;
    body: React.ReactNode;
}

const OTHER_PAGES = [
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/returns", label: "Returns & Refunds" },
    { href: "/delivery", label: "Delivery Policy" },
];

/** Renders a LEGAL value; unfilled [placeholders] are highlighted so they can't ship unnoticed. */
export function V({ children }: { children: string | number }) {
    const s = String(children);
    return isPlaceholder(s)
        ? <mark className="rounded bg-[#fff4c2] px-1 text-[#7a5b00]" title="Placeholder — set in src/lib/legal.ts">{s}</mark>
        : <>{s}</>;
}

/** Shared shell for /terms, /privacy, /returns, /delivery: hero, sticky contents, readable prose. */
export default function LegalPage({ path, crumb, title, intro, sections }: {
    path: string;
    crumb: string;
    title: string;
    intro: string;
    sections: LegalSection[];
}) {
    return (
        <div className="min-h-screen bg-white">
            <Topbar />
            <MainHeader />
            <NavBar activeTab="" />
            <PageHero eyebrow="Policies" crumb={crumb} title={title} subtitle={intro} />

            <main className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[240px_1fr] lg:py-16">
                <aside className="lg:sticky lg:top-28 lg:h-fit">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-faint">On this page</p>
                    <nav className="flex flex-col gap-1 border-l border-line">
                        {sections.map((s, i) => (
                            <a key={s.id} href={`#${s.id}`} className="-ml-px border-l-2 border-transparent py-1 pl-3 text-[13px] text-mutedink transition hover:border-brand hover:text-carbon">
                                {i + 1}. {s.title}
                            </a>
                        ))}
                    </nav>
                    <p className="mb-3 mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-faint">Other policies</p>
                    <nav className="flex flex-col gap-1.5">
                        {OTHER_PAGES.filter((p) => p.href !== path).map((p) => (
                            <Link key={p.href} href={p.href} className="inline-flex items-center gap-2 text-[13px] text-mutedink hover:text-brand-ink">
                                <FileText size={14} className="text-faint" /> {p.label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                <article className="min-w-0 max-w-[760px]">
                    <p className="mb-8 text-[13px] text-faint">Last updated: {LEGAL.lastUpdated}</p>
                    <div className="space-y-10">
                        {sections.map((s, i) => (
                            <section key={s.id} id={s.id} className="scroll-mt-28">
                                <h2 className="font-display text-xl font-extrabold tracking-[-0.01em] text-carbon">{i + 1}. {s.title}</h2>
                                <div className="legal-prose mt-3 space-y-3 text-[15px] leading-relaxed text-[#3d4552] [&_a]:font-semibold [&_a]:text-brand-ink [&_a:hover]:underline [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_strong]:text-carbon [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                                    {s.body}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="mt-12 rounded-2xl border border-line bg-surface p-6">
                        <p className="font-display text-base font-bold text-carbon">Questions about this policy?</p>
                        <p className="mt-1 text-sm text-mutedink">Our team is available {LEGAL.hours}.</p>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <a href={`mailto:${LEGAL.email}`} className="inline-flex items-center gap-2 font-semibold text-brand-ink hover:underline"><Mail size={15} /> {LEGAL.email}</a>
                            <a href={`tel:${LEGAL.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-semibold text-brand-ink hover:underline"><Phone size={15} /> {LEGAL.phone}</a>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
