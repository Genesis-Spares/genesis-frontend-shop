'use client'

import { useState } from "react";
import Link from "next/link";
import { Car, CheckCircle2, ChevronDown, HelpCircle, XCircle } from "lucide-react";
import { fitsVehicle, vehicleLabel, type ApiFitment } from "@/lib/api";
import VehicleSelector from "./VehicleSelector";
import { shopUrlFor, useVehicle } from "./useVehicle";

const years = (f: ApiFitment) =>
    f.yearFrom && f.yearTo ? (f.yearFrom === f.yearTo ? `${f.yearFrom}` : `${f.yearFrom}–${f.yearTo}`)
        : f.yearFrom ? `${f.yearFrom} on` : f.yearTo ? `up to ${f.yearTo}` : "all years";

/** "Does this part fit my car?" on the product page, driven by the shopper's saved vehicle. */
export default function FitCheck({ productName, isUniversal, fitments, legacyText }: {
    productName: string;
    isUniversal: boolean;
    fitments: ApiFitment[];
    /** free-text compatibility for products without structured fitment yet */
    legacyText?: string;
}) {
    const { vehicle, setVehicle } = useVehicle();
    const [picking, setPicking] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const result = vehicle && vehicle.model ? fitsVehicle({ isUniversal, fitments }, vehicle) : null;
    const match = vehicle && result === true
        ? fitments.find((f) => f.make.toLowerCase() === vehicle.make.toLowerCase() && f.model.toLowerCase() === vehicle.model.toLowerCase()
            && (!vehicle.year || ((f.yearFrom == null || f.yearFrom <= vehicle.year) && (f.yearTo == null || f.yearTo >= vehicle.year))))
        : undefined;
    const askUrl = `/contact-us?topic=${encodeURIComponent("Fitment question")}`;

    const change = (
        <button type="button" onClick={() => setPicking(true)} className="text-[12.5px] font-semibold text-brand-ink underline-offset-2 hover:underline">
            {vehicle ? "Change vehicle" : "Select vehicle"}
        </button>
    );

    let banner: React.ReactNode;
    if (picking) {
        banner = (
            <div className="rounded-xl border border-line bg-surface p-4">
                <p className="mb-3 text-[13.5px] font-semibold text-carbon">Which vehicle is it for?</p>
                <VehicleSelector variant="inline" navigate={false} onDone={() => setPicking(false)} />
            </div>
        );
    } else if (!vehicle) {
        banner = (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5">
                <Car size={22} className="shrink-0 text-brand" />
                <span className="text-[13.5px] text-carbon">Check if this part fits your vehicle</span>
                <span className="ml-auto">{change}</span>
            </div>
        );
    } else if (result === "universal") {
        banner = (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#c7e8d6] bg-stock-wash px-4 py-3.5">
                <CheckCircle2 size={22} className="shrink-0 text-stock" />
                <span className="text-[13.5px]"><strong className="text-stock">Universal part</strong> <span className="text-mutedink">— suitable for your {vehicleLabel(vehicle)}</span></span>
                <span className="ml-auto">{change}</span>
            </div>
        );
    } else if (result === true) {
        banner = (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#c7e8d6] bg-stock-wash px-4 py-3.5">
                <CheckCircle2 size={22} className="shrink-0 text-stock" />
                <span className="text-[13.5px]">
                    <strong className="text-stock">Fits your {vehicleLabel(vehicle)}</strong>
                    {(match?.engine || match?.notes) && <span className="block text-[12.5px] text-mutedink">{[match.engine, match.notes].filter(Boolean).join(" · ")}</span>}
                </span>
                <span className="ml-auto">{change}</span>
            </div>
        );
    } else if (result === false) {
        banner = (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#f3cfcb] bg-[#fdf3f2] px-4 py-3.5">
                <XCircle size={22} className="shrink-0 text-[#b23b32]" />
                <span className="text-[13.5px]">
                    <strong className="text-[#b23b32]">Doesn&apos;t fit your {vehicleLabel(vehicle)}</strong>
                    <span className="block text-[12.5px] text-mutedink">
                        <Link href={shopUrlFor(vehicle)} className="font-semibold text-brand-ink hover:underline">See parts that fit</Link>
                        {" "}or <Link href={askUrl} className="font-semibold text-brand-ink hover:underline">ask us</Link>.
                    </span>
                </span>
                <span className="ml-auto flex gap-3">{change}<button type="button" onClick={() => setVehicle(null)} className="text-[12.5px] text-faint hover:text-carbon">Clear</button></span>
            </div>
        );
    } else {
        banner = (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5">
                <HelpCircle size={22} className="shrink-0 text-faint" />
                <span className="text-[13.5px] text-carbon">
                    We haven&apos;t listed fitment for this part yet.
                    <span className="block text-[12.5px] text-mutedink">
                        <Link href={askUrl} className="font-semibold text-brand-ink hover:underline">Ask us to confirm</Link> it fits your {vehicleLabel(vehicle)} before ordering.
                    </span>
                </span>
                <span className="ml-auto">{change}</span>
            </div>
        );
    }

    const listCount = fitments.length;

    return (
        <div className="mt-5 space-y-2">
            {banner}
            {listCount > 0 ? (
                <div>
                    <button type="button" onClick={() => setShowAll((s) => !s)} aria-expanded={showAll}
                        className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-mutedink hover:text-carbon">
                        {showAll ? "Hide" : "Show"} all {listCount} compatible vehicle{listCount === 1 ? "" : "s"}
                        <ChevronDown size={14} className={`transition ${showAll ? "rotate-180" : ""}`} />
                    </button>
                    {showAll && (
                        <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 rounded-xl border border-line px-4 py-3 text-[13px] sm:grid-cols-2" aria-label={`Vehicles ${productName} fits`}>
                            {fitments.map((f, i) => (
                                <li key={`${f.make}-${f.model}-${i}`} className="text-carbon">
                                    {f.make} {f.model} <span className="text-faint">· {years(f)}</span>
                                    {f.engine && <span className="text-faint"> · {f.engine}</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : !isUniversal && legacyText ? (
                <p className="text-[12.5px] text-mutedink"><span className="font-semibold text-carbon">Listed fitment:</span> {legacyText}</p>
            ) : null}
        </div>
    );
}
