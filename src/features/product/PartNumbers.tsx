'use client'

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { PART_TYPE_LABEL, type ApiPartNumber } from "@/lib/api";

const ORDER: ApiPartNumber["type"][] = ["OE", "MANUFACTURER", "AFTERMARKET"];
const HINT: Record<ApiPartNumber["type"], string> = {
    OE: "Original-equipment numbers from the vehicle maker",
    MANUFACTURER: "The maker's own part number",
    AFTERMARKET: "Equivalent parts from other brands (interchangeable)",
};

/** Cross-reference table: OE / manufacturer / aftermarket numbers, grouped, with copy buttons. */
export default function PartNumbers({ numbers }: { numbers: ApiPartNumber[] }) {
    const [copied, setCopied] = useState<string | null>(null);
    if (!numbers.length) return null;

    const copy = async (n: string) => {
        try { await navigator.clipboard.writeText(n); setCopied(n); setTimeout(() => setCopied(null), 1500); } catch { /* clipboard blocked */ }
    };

    return (
        <section aria-labelledby="pn-heading">
            <h3 id="pn-heading" className="font-display text-lg font-extrabold text-carbon">Part numbers &amp; cross-references</h3>
            <p className="mt-1 text-[13px] text-mutedink">Search any of these numbers to find this part. Always compare with the number on your old part.</p>
            <div className="mt-4 space-y-4">
                {ORDER.filter((t) => numbers.some((n) => n.type === t)).map((t) => (
                    <div key={t}>
                        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-faint">{PART_TYPE_LABEL[t]} <span className="font-normal normal-case tracking-normal">— {HINT[t]}</span></p>
                        <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
                            {numbers.filter((n) => n.type === t).map((n) => (
                                <li key={n.number} className="flex items-center gap-3 px-4 py-2.5 text-[13.5px]">
                                    <span className="w-28 shrink-0 truncate text-mutedink">{n.brand || "—"}</span>
                                    <span className="flex-1 font-mono font-semibold text-carbon">{n.number}</span>
                                    <button type="button" onClick={() => copy(n.number)} aria-label={`Copy ${n.number}`}
                                        className="rounded-md p-1.5 text-faint transition hover:bg-surface hover:text-carbon">
                                        {copied === n.number ? <Check size={15} className="text-stock" /> : <Copy size={15} />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
