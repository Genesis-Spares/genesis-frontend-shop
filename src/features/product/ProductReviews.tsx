'use client'

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Car, Check, Loader2, Pencil, Star, Trash2, X } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getToken } from "@/features/auth/token";
import { AuthError } from "@/features/auth/AuthFields";
import { reviewsApi, type ProductReview, type ReviewPage } from "@/lib/api";

type Sort = "recent" | "highest" | "lowest";
type Eligibility = Awaited<ReturnType<typeof reviewsApi.eligibility>>;

function Stars({ value, size = 16 }: { value: number; size?: number }) {
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={size} className={i <= Math.round(value) ? "fill-[#f5a524] text-[#f5a524]" : "fill-line text-line"} />
            ))}
        </span>
    );
}

const when = (iso: string) => new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

/**
 * Reviews for one part: summary, sorted list and — for verified buyers — a
 * write / edit form. Only customers with a delivered order can review.
 */
export default function ProductReviews({ productId, slug, onCountChange }: { productId: string; slug: string; onCountChange?: (count: number, average: number) => void }) {
    const { user, ready } = useAuth();
    const [sort, setSort] = useState<Sort>("recent");
    const [page, setPage] = useState<ReviewPage | null>(null);
    const [items, setItems] = useState<ProductReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [eligibility, setEligibility] = useState<Eligibility | null>(null);
    const [editing, setEditing] = useState(false);

    // fetch a page; state is only touched once the response arrives
    const fetchPage = useCallback(async (p: number, s: Sort, append: boolean) => {
        try {
            const res = await reviewsApi.list(productId, p, s);
            setPage(res);
            setItems((cur) => (append ? [...cur, ...res.data] : res.data));
            onCountChange?.(res.summary.count, res.summary.average);
        } catch {
            /* keep what we have */
        } finally {
            setLoading(false);
        }
    }, [productId, onCountChange]);

    const [reloadKey, setReloadKey] = useState(0);
    // first page (again on sort change / after saving) — state set only in the callbacks
    useEffect(() => {
        let live = true;
        reviewsApi.list(productId, 1, sort)
            .then((res) => {
                if (!live) return;
                setPage(res);
                setItems(res.data);
                onCountChange?.(res.summary.count, res.summary.average);
            })
            .catch(() => undefined)
            .finally(() => { if (live) setLoading(false); });
        return () => { live = false; };
    }, [productId, sort, reloadKey, onCountChange]);

    const changeSort = (s: Sort) => { setLoading(true); setSort(s); };
    const showMore = () => { if (!page) return; setLoading(true); fetchPage(page.meta.page + 1, sort, true); };

    const [eligibilityKey, setEligibilityKey] = useState(0);
    useEffect(() => {
        const token = getToken();
        if (!ready || !user || !token) return;
        let live = true;
        reviewsApi.eligibility(token, productId).then((e) => live && setEligibility(e)).catch(() => undefined);
        return () => { live = false; };
    }, [ready, user, productId, eligibilityKey]);

    const summary = page?.summary;
    const own = user ? eligibility?.review ?? null : null;

    const afterSave = () => {
        setEditing(false);
        setEligibilityKey((k) => k + 1);
        setLoading(true);
        setReloadKey((k) => k + 1);
    };

    return (
        <section aria-labelledby="reviews-heading" className="grid grid-cols-1 gap-10 lg:grid-cols-[300px_1fr]">
            {/* ── summary + call to action ── */}
            <div>
                <h2 id="reviews-heading" className="font-display text-xl font-extrabold text-carbon">Customer reviews</h2>
                {summary && summary.count > 0 ? (
                    <>
                        <div className="mt-3 flex items-center gap-3">
                            <span className="font-display text-4xl font-extrabold text-carbon">{summary.average.toFixed(1)}</span>
                            <div>
                                <Stars value={summary.average} size={18} />
                                <p className="mt-0.5 text-[13px] text-faint">{summary.count} verified review{summary.count === 1 ? "" : "s"}</p>
                            </div>
                        </div>
                        <ul className="mt-5 space-y-1.5">
                            {summary.distribution.map((d) => (
                                <li key={d.star} className="flex items-center gap-2.5 text-[13px]">
                                    <span className="w-10 text-mutedink">{d.star} star</span>
                                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                                        <span className="block h-full rounded-full bg-[#f5a524]" style={{ width: `${summary.count ? (d.count / summary.count) * 100 : 0}%` }} />
                                    </span>
                                    <span className="w-6 text-right tabular-nums text-faint">{d.count}</span>
                                </li>
                            ))}
                        </ul>
                        {summary.fitRate !== null && (
                            <p className="mt-5 flex items-start gap-2 rounded-xl bg-stock-wash px-3.5 py-3 text-[13px] text-stock">
                                <Car size={16} className="mt-0.5 shrink-0" />
                                <span><strong>{summary.fitRate}%</strong> of buyers said it fitted their vehicle ({summary.fitAnswers} answer{summary.fitAnswers === 1 ? "" : "s"}).</span>
                            </p>
                        )}
                    </>
                ) : !loading && (
                    <p className="mt-3 text-[14px] text-mutedink">No reviews yet. Bought this part? Be the first to say how it fitted.</p>
                )}

                <div className="mt-6 rounded-2xl border border-line p-4">
                    {!ready ? null : !user ? (
                        <p className="text-[13.5px] text-mutedink">
                            <Link href={`/account/login?redirect=${encodeURIComponent(`/products/${slug}`)}`} className="font-semibold text-brand-ink hover:underline">Sign in</Link>{" "}to review a part you&apos;ve bought.
                        </p>
                    ) : !eligibility ? (
                        <Loader2 size={16} className="animate-spin text-faint" />
                    ) : own ? (
                        <div className="text-[13.5px]">
                            <p className="font-semibold text-carbon">You reviewed this part</p>
                            {own.status === "HIDDEN" ? (
                                <p className="mt-1 text-[#b23b32]">Your review was removed by our team and isn&apos;t shown publicly.</p>
                            ) : (
                                <button onClick={() => setEditing(true)} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-brand-ink hover:underline"><Pencil size={14} /> Edit your review</button>
                            )}
                        </div>
                    ) : eligibility.canReview ? (
                        <div className="text-[13.5px]">
                            <p className="font-semibold text-carbon">You bought this part</p>
                            <p className="mt-0.5 text-mutedink">Help other drivers — how did it fit?</p>
                            <button onClick={() => setEditing(true)} className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 font-semibold text-white transition hover:bg-brand-hover">
                                <Star size={15} /> Write a review
                            </button>
                        </div>
                    ) : (
                        <p className="text-[13px] text-mutedink">Only verified buyers can review. You&apos;ll be able to review this part once your order is delivered.</p>
                    )}
                </div>
            </div>

            {/* ── form + list ── */}
            <div className="min-w-0">
                {editing && (
                    <ReviewForm
                        productId={productId}
                        existing={own}
                        firstName={user?.firstName}
                        lastName={user?.lastName}
                        onCancel={() => setEditing(false)}
                        onSaved={afterSave}
                    />
                )}

                {(summary?.count ?? 0) > 1 && (
                    <div className="mb-4 flex items-center justify-end gap-2 text-[13px]">
                        <label htmlFor="review-sort" className="text-faint">Sort by</label>
                        <select id="review-sort" value={sort} onChange={(e) => changeSort(e.target.value as Sort)} className="h-9 rounded-lg border border-line-strong bg-white px-2.5 text-carbon outline-none focus:border-brand">
                            <option value="recent">Most recent</option>
                            <option value="highest">Highest rated</option>
                            <option value="lowest">Lowest rated</option>
                        </select>
                    </div>
                )}

                {loading && items.length === 0 ? (
                    <div className="space-y-4">{[0, 1].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />)}</div>
                ) : (
                    <ul className="divide-y divide-line">
                        {items.map((r) => (
                            <li key={r.id} className="py-5 first:pt-0">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <Stars value={r.rating} size={15} />
                                    {r.title && <span className="font-semibold text-carbon">{r.title}</span>}
                                </div>
                                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-faint">
                                    <span className="font-medium text-mutedink">{r.userName}</span>
                                    {r.isVerified && <span className="inline-flex items-center gap-1 text-stock"><BadgeCheck size={13} /> Verified purchase</span>}
                                    <span>· {when(r.createdAt)}</span>
                                </p>
                                {r.vehicle && (
                                    <p className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-medium ${r.fitted === false ? "bg-[#fdf3f2] text-[#b23b32]" : "bg-surface text-carbon"}`}>
                                        <Car size={14} /> {r.fitted === false ? "Didn't fit" : r.fitted ? "Fitted" : "Used on"} my {r.vehicle}
                                        {r.fitted === true && <Check size={13} className="text-stock" />}
                                        {r.fitted === false && <X size={13} />}
                                    </p>
                                )}
                                {r.content && <p className="mt-2 whitespace-pre-line text-[14.5px] leading-relaxed text-[#3d4552]">{r.content}</p>}
                            </li>
                        ))}
                    </ul>
                )}

                {page && page.meta.page < page.meta.totalPages && (
                    <button onClick={showMore} disabled={loading}
                        className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-line-strong px-5 text-[13.5px] font-semibold text-carbon transition hover:border-brand hover:text-brand-ink disabled:opacity-60">
                        {loading && <Loader2 size={15} className="animate-spin" />} Show more reviews
                    </button>
                )}
            </div>
        </section>
    );
}

function ReviewForm({ productId, existing, firstName, lastName, onCancel, onSaved }: {
    productId: string;
    existing: ProductReview | null;
    firstName?: string;
    lastName?: string;
    onCancel: () => void;
    onSaved: () => void;
}) {
    const [rating, setRating] = useState(existing?.rating ?? 0);
    const [hover, setHover] = useState(0);
    const [title, setTitle] = useState(existing?.title ?? "");
    const [content, setContent] = useState(existing?.content ?? "");
    const [vehicle, setVehicle] = useState(existing?.vehicle ?? "");
    const [fitted, setFitted] = useState<boolean | null>(existing?.fitted ?? null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const field = "w-full rounded-xl border border-line-strong bg-white px-3.5 text-[14px] text-carbon outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";
    const lbl = "mb-1.5 block text-[13px] font-semibold text-carbon";

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token || !rating) return;
        setBusy(true); setError(null);
        try {
            await reviewsApi.save(token, productId, {
                rating,
                title: title.trim() || undefined,
                content: content.trim() || undefined,
                vehicle: vehicle.trim() || undefined,
                fitted: fitted ?? undefined,
                firstName,
                lastName,
            });
            onSaved();
        } catch (err) {
            setError((err instanceof Error && err.message) || "Couldn't save your review.");
        } finally { setBusy(false); }
    };

    const remove = async () => {
        const token = getToken();
        if (!token || !window.confirm("Delete your review?")) return;
        setBusy(true);
        try { await reviewsApi.remove(token, productId); onSaved(); }
        catch (err) { setError((err instanceof Error && err.message) || "Couldn't delete your review."); }
        finally { setBusy(false); }
    };

    return (
        <form onSubmit={submit} className="mb-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <p className="font-display text-lg font-extrabold text-carbon">{existing ? "Edit your review" : "Write a review"}</p>
            {error && <div className="mt-3"><AuthError>{error}</AuthError></div>}

            <div className="mt-4">
                <span className={lbl}>Your rating <span className="text-brand">*</span></span>
                <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} star${i === 1 ? "" : "s"}`}
                            onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} className="p-0.5">
                            <Star size={28} className={i <= (hover || rating) ? "fill-[#f5a524] text-[#f5a524]" : "fill-white text-line-strong"} />
                        </button>
                    ))}
                    <span className="ml-2 text-[13px] text-faint">{["", "Poor", "Fair", "Good", "Very good", "Excellent"][hover || rating]}</span>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className={lbl} htmlFor="rv-vehicle">Your vehicle</label>
                    <input id="rv-vehicle" maxLength={80} className={`${field} h-11`} value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="e.g. 2015 Toyota Fielder" />
                </div>
                <div>
                    <span className={lbl}>Did it fit?</span>
                    <div className="flex gap-2">
                        {[{ v: true, l: "Yes, it fitted" }, { v: false, l: "No" }].map((o) => (
                            <button key={String(o.v)} type="button" onClick={() => setFitted(fitted === o.v ? null : o.v)} aria-pressed={fitted === o.v}
                                className={`h-11 flex-1 rounded-xl border text-[13.5px] font-semibold transition ${fitted === o.v ? "border-brand bg-brand-wash text-brand-ink" : "border-line-strong bg-white text-mutedink hover:border-[#c9cdd6]"}`}>
                                {o.l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <label className={lbl} htmlFor="rv-title">Headline</label>
                <input id="rv-title" maxLength={120} className={`${field} h-11`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sum it up in a few words" />
            </div>
            <div className="mt-4">
                <label className={lbl} htmlFor="rv-content">Your review</label>
                <textarea id="rv-content" maxLength={2000} rows={4} className={`${field} resize-y py-3`} value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="Quality, fitment, anything other buyers should know…" />
            </div>

            <p className="mt-3 text-[12px] text-faint">Shown as &ldquo;{firstName ? `${firstName}${lastName ? ` ${lastName[0]}.` : ""}` : "Verified buyer"}&rdquo; with a verified-purchase badge.</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="submit" disabled={!rating || busy} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-6 font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50">
                    {busy && <Loader2 size={16} className="animate-spin" />} {existing ? "Save changes" : "Post review"}
                </button>
                <button type="button" onClick={onCancel} className="h-11 rounded-xl px-4 text-[13.5px] font-semibold text-mutedink hover:text-carbon">Cancel</button>
                {existing && (
                    <button type="button" onClick={remove} disabled={busy} className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#b23b32] hover:underline disabled:opacity-50">
                        <Trash2 size={14} /> Delete review
                    </button>
                )}
            </div>
        </form>
    );
}
