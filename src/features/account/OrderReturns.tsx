'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { getToken } from "@/features/auth/token";
import { AuthError } from "@/features/auth/AuthFields";
import { returnsApi, type ReturnEligibility, type ReturnRequest } from "@/lib/api";
import { formatKSh } from "@/libs/utils";
import { cardCls } from "./AccountShell";

const STEPS: { key: ReturnRequest["status"]; label: string }[] = [
    { key: "REQUESTED", label: "Requested" },
    { key: "APPROVED", label: "Approved" },
    { key: "RECEIVED", label: "Received" },
    { key: "REFUNDED", label: "Refunded" },
];

/** Cancel / return actions and return progress on the customer's order page. */
export default function OrderReturns({ orderId, justReturned, onChanged }: { orderId: string; justReturned?: string | null; onChanged: () => void }) {
    const [elig, setElig] = useState<ReturnEligibility | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [cancelling, setCancelling] = useState(false);
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) return;
        let live = true;
        returnsApi.eligibility(token, orderId).then((e) => live && setElig(e)).catch(() => undefined);
        return () => { live = false; };
    }, [orderId, reloadKey]);

    if (!elig) return null;

    const cancel = async () => {
        const token = getToken();
        if (!token) return;
        setBusy(true); setError(null);
        try {
            await returnsApi.cancelOrder(token, orderId, reason.trim() || undefined);
            setCancelling(false);
            setReloadKey((k) => k + 1);
            onChanged();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't cancel the order.");
        } finally { setBusy(false); }
    };

    const hasActions = elig.canCancel || elig.canReturn;
    if (!hasActions && !elig.returns.length) return null;

    return (
        <div className="mt-6 space-y-4">
            {justReturned && (
                <div className="flex items-start gap-3 rounded-2xl border border-[#cfe9dc] bg-stock-wash p-4 text-[13.5px]">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-stock" />
                    <p><strong className="text-carbon">Return {justReturned} submitted.</strong> <span className="text-mutedink">We&apos;ve emailed you a copy and will reply within one business day.</span></p>
                </div>
            )}
            {error && <AuthError>{error}</AuthError>}

            {hasActions && (
                <div className={`${cardCls} flex flex-wrap items-center gap-3 px-5 py-4`}>
                    <div className="mr-auto text-[13.5px]">
                        {elig.canCancel ? (
                            <><p className="font-semibold text-carbon">Changed your mind?</p><p className="text-mutedink">You can cancel until we start preparing your order.</p></>
                        ) : (
                            <><p className="font-semibold text-carbon">Something not right?</p>
                                <p className="text-mutedink">Return unfitted parts until {elig.deadline ? new Date(elig.deadline).toLocaleDateString("en-KE", { day: "numeric", month: "long" }) : `${elig.windowDays} days after delivery`}.</p></>
                        )}
                    </div>
                    {elig.canCancel && !cancelling && (
                        <button onClick={() => setCancelling(true)} className="h-10 rounded-xl border border-[#f0cfcb] px-4 text-[13.5px] font-semibold text-[#b23b32] transition hover:bg-[#fdf3f2]">Cancel order</button>
                    )}
                    {elig.canReturn && (
                        <Link href={`/account/orders/${orderId}/return`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-carbon px-4 text-[13.5px] font-semibold text-white transition hover:bg-carbon-soft">
                            <RotateCcw size={15} /> Return items
                        </Link>
                    )}
                    {cancelling && (
                        <div className="w-full rounded-xl border border-line bg-surface p-4">
                            <label htmlFor="cancel-reason" className="mb-1.5 block text-[13px] font-semibold text-carbon">Why are you cancelling? <span className="font-normal text-faint">(optional)</span></label>
                            <input id="cancel-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300}
                                className="h-11 w-full rounded-xl border border-line-strong bg-white px-3.5 text-[14px] outline-none focus:border-brand" placeholder="e.g. Ordered the wrong size" />
                            <p className="mt-2 text-[12px] text-mutedink">If you&apos;ve already paid, your refund goes back to your original payment method.</p>
                            <div className="mt-3 flex gap-2">
                                <button onClick={cancel} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#b23b32] px-4 text-[13.5px] font-semibold text-white hover:bg-[#9a322a] disabled:opacity-60">
                                    {busy && <Loader2 size={15} className="animate-spin" />} Yes, cancel order
                                </button>
                                <button onClick={() => setCancelling(false)} className="h-10 rounded-xl px-4 text-[13.5px] font-semibold text-mutedink hover:text-carbon">Keep order</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {elig.returns.map((r) => {
                const idx = STEPS.findIndex((s) => s.key === r.status);
                return (
                    <div key={r.id} className={cardCls}>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
                            <p className="text-[13.5px]"><span className="font-mono font-semibold text-carbon">{r.rmaNumber}</span> <span className="text-mutedink">· {r.reasonLabel}</span></p>
                            <p className="text-[12px] text-faint">{new Date(r.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                        <div className="px-5 py-4">
                            {r.status === "REJECTED" ? (
                                <p className="flex items-start gap-2 text-[13.5px] text-[#b23b32]"><XCircle size={17} className="mt-0.5 shrink-0" /><span><strong>Return declined.</strong> <span className="text-mutedink">{r.rejectReason}</span></span></p>
                            ) : (
                                <ol className="grid grid-cols-4 text-center">
                                    {STEPS.map((s, i) => (
                                        <li key={s.key} className="relative flex flex-col items-center">
                                            {i > 0 && <span className={`absolute right-1/2 top-3 h-0.5 w-full ${i <= idx ? "bg-brand" : "bg-line"}`} />}
                                            <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${i <= idx ? "bg-brand text-white" : "border-2 border-line-strong bg-white text-faint"}`}>
                                                {i <= idx ? <Check size={13} strokeWidth={3} /> : i + 1}
                                            </span>
                                            <span className={`mt-1.5 text-[12px] font-semibold ${i <= idx ? "text-carbon" : "text-faint"}`}>{s.label}</span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                            {r.status === "APPROVED" && r.instructions && (
                                <div className="mt-4 rounded-xl bg-brand-wash px-4 py-3 text-[13px] text-carbon"><strong>Next step:</strong> {r.instructions}</div>
                            )}
                            {r.status === "REFUNDED" && r.refundAmount != null && (
                                <p className="mt-4 text-[13px] text-stock">Refund of <strong>{formatKSh(r.refundAmount)}</strong> issued.</p>
                            )}
                            <ul className="mt-3 text-[12.5px] text-mutedink">
                                {r.items.map((i) => <li key={i.id}>{i.quantity} × {i.name}</li>)}
                            </ul>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
