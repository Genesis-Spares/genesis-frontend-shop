'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, ChevronDown, Loader2, Search } from "lucide-react";
import { vehiclesApi, type Vehicle } from "@/lib/api";
import { shopUrlFor, useVehicle } from "./useVehicle";

/**
 * Make → Model → Year picker. Options come from the catalogue's fitment data,
 * so every choice has parts. On submit it saves "My vehicle" and (by default)
 * opens the shop filtered to parts that fit.
 */
export default function VehicleSelector({
    variant = "card",
    onDone,
    navigate = true,
}: {
    variant?: "card" | "inline";
    /** called after a vehicle is chosen (e.g. to close an editor) */
    onDone?: (v: Vehicle) => void;
    /** go to the filtered shop after choosing (default true) */
    navigate?: boolean;
}) {
    const router = useRouter();
    const { vehicle, setVehicle } = useVehicle();

    const [make, setMake] = useState(vehicle?.make ?? "");
    const [model, setModel] = useState(vehicle?.model ?? "");
    const [year, setYear] = useState<string>(vehicle?.year ? String(vehicle.year) : "");

    const [makes, setMakes] = useState<{ make: string; parts: number }[] | null>(null);
    const [models, setModels] = useState<{ model: string; parts: number }[]>([]);
    const [years, setYears] = useState<number[]>([]);

    useEffect(() => {
        let live = true;
        vehiclesApi.makes().then((m) => live && setMakes(m)).catch(() => live && setMakes([]));
        return () => { live = false; };
    }, []);

    useEffect(() => {
        if (!make) return;
        let live = true;
        vehiclesApi.models(make).then((m) => live && setModels(m)).catch(() => undefined);
        return () => { live = false; };
    }, [make]);

    useEffect(() => {
        if (!make || !model) return;
        let live = true;
        vehiclesApi.years(make, model).then((y) => live && setYears(y)).catch(() => undefined);
        return () => { live = false; };
    }, [make, model]);

    const pickMake = (v: string) => { setMake(v); setModel(""); setYear(""); setModels([]); setYears([]); };
    const pickModel = (v: string) => { setModel(v); setYear(""); setYears([]); };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!make || !model) return;
        const v: Vehicle = { make, model, ...(year ? { year: Number(year) } : {}) };
        setVehicle(v);
        onDone?.(v);
        if (navigate) router.push(shopUrlFor(v));
    };

    const sel =
        "h-12 w-full appearance-none rounded-xl border border-line-strong bg-white pl-3.5 pr-9 text-[14px] text-carbon outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-surface disabled:text-faint";
    const none = makes !== null && makes.length === 0;

    const fields = (
        <>
            <div className="relative">
                <label htmlFor="vf-make" className="sr-only">Make</label>
                <select id="vf-make" value={make} onChange={(e) => pickMake(e.target.value)} className={sel} disabled={!makes || none}>
                    <option value="">{makes ? (none ? "No vehicles yet" : "Make") : "Loading…"}</option>
                    {makes?.map((m) => <option key={m.make} value={m.make}>{m.make}</option>)}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint" />
            </div>
            <div className="relative">
                <label htmlFor="vf-model" className="sr-only">Model</label>
                <select id="vf-model" value={model} onChange={(e) => pickModel(e.target.value)} className={sel} disabled={!make}>
                    <option value="">Model</option>
                    {models.map((m) => <option key={m.model} value={m.model}>{m.model}</option>)}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint" />
            </div>
            <div className="relative">
                <label htmlFor="vf-year" className="sr-only">Year</label>
                <select id="vf-year" value={year} onChange={(e) => setYear(e.target.value)} className={sel} disabled={!model}>
                    <option value="">Any year</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint" />
            </div>
            <button type="submit" disabled={!make || !model}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50">
                {makes === null ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />} Find parts
            </button>
        </>
    );

    if (variant === "inline") {
        return <form onSubmit={submit} className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1fr_0.8fr_auto]">{fields}</form>;
    }

    return (
        <form onSubmit={submit} className="rounded-2xl border border-hairline bg-white p-5 shadow-[0_18px_40px_-24px_rgba(20,22,28,0.35)] sm:p-6">
            <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-wash text-brand"><Car size={20} /></span>
                <div>
                    <p className="font-display text-lg font-extrabold text-carbon">Find parts for your vehicle</p>
                    <p className="text-[13px] text-mutedink">Choose your car and we&apos;ll show only parts that fit.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr_auto]">{fields}</div>
        </form>
    );
}
