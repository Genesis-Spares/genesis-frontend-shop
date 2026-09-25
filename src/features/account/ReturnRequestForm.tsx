'use client'

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Minus, Package, Plus, RotateCcw, X } from "lucide-react";
import { getToken } from "@/features/auth/token";
import { AuthError } from "@/features/auth/AuthFields";
import { photoUpload, returnsApi, type ReturnEligibility, type ReturnReason } from "@/lib/api";
import { formatKSh } from "@/libs/utils";
import { cardCls } from "./AccountShell";

const REASONS: { id: ReturnReason; label: string; hint: string }[] = [
    { id: "DOESNT_FIT", label: "Doesn't fit my vehicle", hint: "Wrong size, connector or mounting" },
    { id: "WRONG_PART", label: "Wrong part sent", hint: "Not what I ordered" },
    { id: "DAMAGED", label: "Arrived damaged", hint: "Broken or dented in transit" },
    { id: "FAULTY", label: "Faulty / not working", hint: "Defective out of the box" },
    { id: "NOT_AS_DESCRIBED", label: "Not as described", hint: "Differs from the listing" },
    { id: "CHANGED_MIND", label: "Changed my mind", hint: "Return delivery at your cost" },
];

export default function ReturnRequestForm() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);

    const [elig, setElig] = useState<ReturnEligibility | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [qty, setQty] = useState<Record<string, number>>({});
    const [reason, setReason] = useState<ReturnReason | null>(null);
    const [details, setDetails] = useState("");
    const [photos, setPhotos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [resolution, setResolution] = useState<"REFUND" | "EXCHANGE">("REFUND");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token || !id) return;
        let live = true;
        returnsApi.eligibility(token, id)
            .then((e) => live && setElig(e))
            .catch((e: unknown) => live && setLoadError(e instanceof Error ? e.message : "Couldn't load this order."));
        return () => { live = false; };
    }, [id]);

    const selected = (elig?.items ?? []).filter((i) => (qty[i.orderItemId] ?? 0) > 0);
    const value = selected.reduce((n, i) => n + i.unitPrice * (qty[i.orderItemId] ?? 0), 0);
    const needsPhotos = reason === "DAMAGED" || reason === "FAULTY";

    const addPhotos = async (files: FileList | null) => {
        if (!files?.length) return;
        setUploading(true); setError(null);
        try {
            const room = 4 - photos.length;
            const urls = await Promise.all([...files].slice(0, room).map((f) => photoUpload.upload(f)));
            setPhotos((p) => [...p, ...urls]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Upload failed.");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token || !reason || !selected.length) return;
        setBusy(true); setError(null);
        try {
            const r = await returnsApi.create(token, id, {
                items: selected.map((i) => ({ orderItemId: i.orderItemId, quantity: qty[i.orderItemId] })),
                reason,
                details: details.trim() || undefined,
                photos: photos.length ? photos : undefined,
                resolution,
            });
            router.replace(`/account/orders/${id}?return=${encodeURIComponent(r.rmaNumber)}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't submit your return.");
            setBusy(false);
        }
    };

    const back = (
        <Link href={`/account/orders/${id}`} className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-mutedink transition hover:text-carbon">
            <ArrowLeft size={15} /> Back to order
        </Link>
    );

    if (loadError) return <div>{back}<AuthError>{loadError}</AuthError></div>;
    if (!elig) return <div>{back}<div className={`${cardCls} flex justify-center py-24 text-faint`}><Loader2 size={22} className="animate-spin" /></div></div>;
    if (!elig.canReturn) {
        return (
            <div>{back}
                <div className={`${cardCls} px-6 py-12 text-center`}>
                    <RotateCcw size={28} className="mx-auto text-faint" />
                    <p className="mt-3 font-display text-lg font-bold text-carbon">This order can&apos;t be returned online</p>
                    <p className="mt-1 text-sm text-mutedink">{elig.reason}</p>
                    <Link href={`/contact-us?topic=${encodeURIComponent("Returns & warranty")}`} className="mt-5 inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">Contact us</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300">
            {back}
            <h2 className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-carbon">Return items</h2>
            <p className="mt-1 text-sm text-mutedink">
                Unfitted parts in their original packaging can be returned until{" "}
                <strong className="text-carbon">{elig.deadline ? new Date(elig.deadline).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" }) : `${elig.windowDays} days after delivery`}</strong>.{" "}
                <Link href="/returns" target="_blank" className="font-semibold text-brand-ink hover:underline">Returns policy</Link>
            </p>

            <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    {error && <AuthError>{error}</AuthError>}

                    {/* 1. items */}
                    <section className={cardCls}>
                        <h3 className="border-b border-line px-6 py-4 font-display text-base font-bold text-carbon">1. Which items?</h3>
                        <ul className="divide-y divide-line px-6">
                            {elig.items.map((i) => {
                                const q = qty[i.orderItemId] ?? 0;
                                const set = (n: number) => setQty((cur) => ({ ...cur, [i.orderItemId]: Math.max(0, Math.min(i.returnable, n)) }));
                                return (
                                    <li key={i.orderItemId} className={`flex items-center gap-4 py-4 ${i.returnable === 0 ? "opacity-50" : ""}`}>
                                        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface">
                                            {i.image ? <Image src={i.image} alt="" width={56} height={56} className="h-full w-full object-contain p-1.5" /> : <Package size={20} className="text-line-strong" />}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[14px] font-semibold text-carbon">{i.name}</p>
                                            <p className="text-[12.5px] text-faint">{i.sku} · {formatKSh(i.unitPrice)} · {i.returnable === 0 ? "already in a return" : `${i.returnable} of ${i.ordered} returnable`}</p>
                                        </div>
                                        {i.returnable > 0 && (
                                            <div className="flex items-center overflow-hidden rounded-lg border border-line-strong">
                                                <button type="button" onClick={() => set(q - 1)} disabled={q === 0} aria-label="Fewer" className="flex h-9 w-9 items-center justify-center bg-surface text-mutedink disabled:opacity-40"><Minus size={14} /></button>
                                                <span className="w-9 text-center font-bold">{q}</span>
                                                <button type="button" onClick={() => set(q + 1)} disabled={q >= i.returnable} aria-label="More" className="flex h-9 w-9 items-center justify-center bg-surface text-mutedink disabled:opacity-40"><Plus size={14} /></button>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    {/* 2. reason */}
                    <section className={cardCls}>
                        <h3 className="border-b border-line px-6 py-4 font-display text-base font-bold text-carbon">2. Why are you returning it?</h3>
                        <div className="grid grid-cols-1 gap-2.5 p-6 sm:grid-cols-2" role="radiogroup" aria-label="Reason">
                            {REASONS.map((r) => (
                                <button key={r.id} type="button" role="radio" aria-checked={reason === r.id} onClick={() => setReason(r.id)}
                                    className={`rounded-xl border px-4 py-3 text-left transition ${reason === r.id ? "border-brand bg-brand-wash" : "border-line-strong hover:border-[#c9cdd6]"}`}>
                                    <span className="block text-[14px] font-semibold text-carbon">{r.label}</span>
                                    <span className="block text-[12.5px] text-mutedink">{r.hint}</span>
                                </button>
                            ))}
                        </div>
                        <div className="px-6 pb-6">
                            <label htmlFor="rt-details" className="mb-1.5 block text-[13px] font-semibold text-carbon">
                                Tell us more {needsPhotos && <span className="font-normal text-mutedink">(what&apos;s wrong with it?)</span>}
                            </label>
                            <textarea id="rt-details" rows={3} maxLength={2000} value={details} onChange={(e) => setDetails(e.target.value)}
                                className="w-full resize-y rounded-xl border border-line-strong bg-white px-3.5 py-3 text-[14px] text-carbon outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                                placeholder={reason === "DOESNT_FIT" ? "e.g. My car needs 5x100, these are 5x114" : "Anything that helps us sort it quickly"} />
                        </div>
                    </section>

                    {/* 3. photos */}
                    {photoUpload.enabled && (
                        <section className={cardCls}>
                            <h3 className="border-b border-line px-6 py-4 font-display text-base font-bold text-carbon">
                                3. Photos <span className="text-[13px] font-normal text-mutedink">{needsPhotos ? "— please add at least one" : "(optional)"}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3 p-6">
                                {photos.map((url) => (
                                    <span key={url} className="relative h-24 w-24 overflow-hidden rounded-xl border border-line">
                                        <Image src={url} alt="Return photo" fill sizes="96px" className="object-cover" />
                                        <button type="button" onClick={() => setPhotos((p) => p.filter((x) => x !== url))} aria-label="Remove photo"
                                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-carbon/80 text-white"><X size={13} /></button>
                                    </span>
                                ))}
                                {photos.length < 4 && (
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                                        className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line-strong text-[12px] font-semibold text-mutedink transition hover:border-brand hover:text-brand-ink disabled:opacity-60">
                                        {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                                        {uploading ? "Uploading" : "Add photo"}
                                    </button>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
                            </div>
                        </section>
                    )}
                </div>

                {/* summary */}
                <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
                    <div className={`${cardCls} p-5`}>
                        <p className="font-display text-base font-bold text-carbon">What would you like?</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {(["REFUND", "EXCHANGE"] as const).map((r) => (
                                <button key={r} type="button" onClick={() => setResolution(r)} aria-pressed={resolution === r}
                                    className={`h-10 rounded-xl border text-[13.5px] font-semibold transition ${resolution === r ? "border-brand bg-brand-wash text-brand-ink" : "border-line-strong text-mutedink"}`}>
                                    {r === "REFUND" ? "Refund" : "Exchange"}
                                </button>
                            ))}
                        </div>
                        <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[13.5px]">
                            <div className="flex justify-between text-mutedink"><dt>Items</dt><dd>{selected.reduce((n, i) => n + (qty[i.orderItemId] ?? 0), 0)}</dd></div>
                            <div className="flex justify-between font-semibold text-carbon"><dt>Item value</dt><dd>{formatKSh(value)}</dd></div>
                        </dl>
                        <p className="mt-2 text-[12px] text-faint">
                            {reason && reason !== "CHANGED_MIND"
                                ? "If it's our mistake, your delivery fee is refunded too."
                                : "Final refund is confirmed once we've checked the part."}
                        </p>
                        <button type="submit" disabled={busy || uploading || !reason || !selected.length || (needsPhotos && photoUpload.enabled && !photos.length && !details.trim())}
                            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50">
                            {busy ? <><Loader2 size={17} className="animate-spin" /> Submitting…</> : <><RotateCcw size={17} /> Request return</>}
                        </button>
                    </div>
                    <p className="px-1 text-[12px] leading-relaxed text-faint">
                        We&apos;ll email you within one business day with next steps. Keep the part unfitted and in its original packaging.
                    </p>
                </aside>
            </form>
        </div>
    );
}
