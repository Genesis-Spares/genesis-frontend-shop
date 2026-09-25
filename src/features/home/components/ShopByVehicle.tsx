import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getJSON } from "@/lib/api";
import VehicleSelector from "@/features/vehicle/VehicleSelector";

/** Home "Shop by vehicle": the Make → Model → Year finder plus real makes with real part counts. */
export default async function ShopByVehicle() {
    const makes = (await getJSON<{ make: string; parts: number }[]>("/storefront/vehicles/makes", undefined, 300)) ?? [];
    const top = [...makes].sort((a, b) => b.parts - a.parts).slice(0, 12);

    return (
        <section className="bg-white">
            <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_1fr] lg:items-center">
                    <div>
                        <span className="eyebrow">Shop by vehicle</span>
                        <h2 className="font-display mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-carbon">
                            Parts that fit — first time
                        </h2>
                        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-mutedink">
                            Tell us your car once. We&apos;ll remember it and show only the parts that fit, plus universal items like oils and bulbs.
                        </p>
                        <div className="mt-6"><VehicleSelector /></div>
                    </div>

                    {top.length > 0 && (
                        <div>
                            <div className="mb-4 flex items-end justify-between">
                                <span className="eyebrow">Browse by make</span>
                                <Link href="/shop" className="text-[13px] font-semibold text-brand-ink hover:underline">All parts</Link>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {top.map((m) => (
                                    <Link
                                        key={m.make}
                                        href={`/shop?make=${encodeURIComponent(m.make)}`}
                                        className="group flex items-center justify-between rounded-xl border border-hairline bg-white px-4 py-3.5 transition hover:-translate-y-[2px] hover:border-brand/40 hover:shadow-[0_1px_2px_rgba(20,22,28,.04),0_12px_24px_-16px_rgba(20,22,28,.22)]"
                                    >
                                        <div>
                                            <div className="font-display text-[15px] font-extrabold tracking-[-0.01em] text-carbon transition-colors group-hover:text-brand">{m.make}</div>
                                            <div className="font-mono text-[11px] text-faint">{m.parts} part{m.parts === 1 ? "" : "s"}</div>
                                        </div>
                                        <ArrowRight size={15} className="text-line-strong transition-colors group-hover:text-brand" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
