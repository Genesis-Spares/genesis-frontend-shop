import Link from "next/link";
import { ArrowRight } from "lucide-react";

const brands = ["BOSCH", "Denso", "NGK", "TRW", "KYB", "Brembo", "Gates", "Valeo", "MANN", "Exide", "Sachs", "Monroe"];

export default function BrandStrip() {
    return (
        <section className="border-y border-line bg-white">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-12">
                <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <span className="eyebrow">Genuine &amp; OEM</span>
                        <h2 className="font-display mt-2 text-[24px] font-extrabold tracking-[-0.02em] text-carbon">
                            Trusted brands we stock
                        </h2>
                    </div>
                    <Link href="/brands" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-ink hover:gap-2.5 transition-all">
                        Explore all brands <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-hairline bg-line sm:grid-cols-4 lg:grid-cols-6">
                    {brands.map((b) => (
                        <Link
                            key={b}
                            href="/brands"
                            className="flex h-20 items-center justify-center bg-white transition hover:bg-surface"
                        >
                            <span className="font-display text-lg font-black tracking-[-0.02em] text-faint transition-colors hover:text-carbon">
                                {b}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
