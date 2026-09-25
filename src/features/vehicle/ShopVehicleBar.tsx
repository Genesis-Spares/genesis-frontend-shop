'use client'

import { useState } from "react";
import Link from "next/link";
import { Car, Check, X } from "lucide-react";
import { vehicleLabel, type Vehicle } from "@/lib/api";
import VehicleSelector from "./VehicleSelector";
import { shopUrlFor, useVehicle } from "./useVehicle";

/**
 * Vehicle context above shop results:
 *  • filtering by a vehicle (from the URL) → "Showing parts that fit …" + change / show all
 *  • a saved vehicle but no filter        → one click to filter
 *  • nothing yet                          → prompt to pick one
 */
export default function ShopVehicleBar({ active, onClear }: { active?: Vehicle; onClear: () => void }) {
    const { vehicle } = useVehicle();
    const [editing, setEditing] = useState(false);

    if (editing) {
        return (
            <div className="mb-6 rounded-2xl border border-line bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-[13.5px] font-semibold text-carbon">Choose your vehicle</p>
                    <button onClick={() => setEditing(false)} aria-label="Close" className="rounded-md p-1 text-faint hover:bg-white hover:text-carbon"><X size={16} /></button>
                </div>
                <VehicleSelector variant="inline" onDone={() => setEditing(false)} />
            </div>
        );
    }

    if (active) {
        return (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#c7e8d6] bg-stock-wash px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-stock"><Check size={18} strokeWidth={2.5} /></span>
                <p className="text-[14px] text-carbon">
                    {active.model ? <>Showing parts that fit your <strong>{vehicleLabel(active)}</strong></> : <>Showing parts for <strong>{active.make}</strong> vehicles</>}
                    <span className="block text-[12.5px] text-mutedink">Includes universal parts. Always check the part number if you&apos;re unsure.</span>
                </p>
                <div className="ml-auto flex gap-2">
                    <button onClick={() => setEditing(true)} className="h-9 rounded-lg border border-line-strong bg-white px-3.5 text-[13px] font-semibold text-carbon hover:border-brand">Change</button>
                    <button onClick={onClear} className="h-9 rounded-lg px-3 text-[13px] font-semibold text-mutedink hover:text-carbon">Show all parts</button>
                </div>
            </div>
        );
    }

    if (vehicle) {
        return (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-wash text-brand"><Car size={18} /></span>
                <p className="text-[14px] text-carbon">Shopping for your <strong>{vehicleLabel(vehicle)}</strong>?</p>
                <div className="ml-auto flex gap-2">
                    <Link href={shopUrlFor(vehicle)} className="inline-flex h-9 items-center rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white hover:bg-brand-hover">Show only parts that fit</Link>
                    <button onClick={() => setEditing(true)} className="h-9 rounded-lg px-3 text-[13px] font-semibold text-mutedink hover:text-carbon">Change vehicle</button>
                </div>
            </div>
        );
    }

    return (
        <button onClick={() => setEditing(true)}
            className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-dashed border-line-strong px-4 py-3 text-left transition hover:border-brand hover:bg-brand-wash/40">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-wash text-brand"><Car size={18} /></span>
            <span className="text-[14px] text-carbon"><strong>Select your vehicle</strong> <span className="text-mutedink">to see only parts that fit</span></span>
            <span className="ml-auto text-[13px] font-semibold text-brand-ink">Choose →</span>
        </button>
    );
}
