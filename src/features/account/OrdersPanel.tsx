'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Loader2, Package, RotateCw, Search, ShieldCheck, Truck } from "lucide-react";
import { orderApi, type ApiOrder } from "@/lib/api";
import { getToken } from "@/features/auth/token";
import { AuthError } from "@/features/auth/AuthFields";
import { PanelHeader, cardCls } from "./AccountShell";
import { StatusBadge, PaymentLabel, PAYMENT_METHOD_LABEL, money, orderDate } from "./orderStatus";

const FILTERS = [
    { id: "all", label: "All" },
    { id: "active", label: "In progress" },
    { id: "DELIVERED", label: "Delivered" },
    { id: "CANCELLED", label: "Cancelled" },
] as const;

const ACTIVE = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"];

export default function OrdersPanel() {
    const [orders, setOrders] = useState<ApiOrder[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const token = getToken();
        if (!token) return;
        let live = true;
        orderApi.list(token, 1, 50)
            .then(({ items }) => { if (live) { setOrders(items); setError(null); } })
            .catch((e: unknown) => { if (live) setError(e instanceof Error ? e.message : "Couldn't load your orders."); });
        return () => { live = false; };
    }, [reload]);

    const shown = (orders ?? []).filter((o) =>
        filter === "all" ? true : filter === "active" ? ACTIVE.includes(o.status) : o.status === filter,
    );

    return (
        <div className="animate-in fade-in duration-300">
            <PanelHeader title="Orders" subtitle="Track deliveries and review your past purchases." />

            {error && (
                <div className="mb-4">
                    <AuthError>
                        {error}{" "}
                        <button onClick={() => { setError(null); setReload((n) => n + 1); }} className="inline-flex items-center gap-1 font-semibold underline underline-offset-2">
                            <RotateCw size={12} /> Retry
                        </button>
                    </AuthError>
                </div>
            )}

            {orders === null && !error && (
                <div className={`${cardCls} flex items-center justify-center py-24 text-faint`}>
                    <Loader2 size={22} className="animate-spin" />
                </div>
            )}

            {orders && orders.length === 0 && <EmptyState />}

            {orders && orders.length > 0 && (
                <>
                    <div className="mb-4 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
                        {FILTERS.map((f) => {
                            const n = f.id === "all" ? orders.length
                                : f.id === "active" ? orders.filter((o) => ACTIVE.includes(o.status)).length
                                    : orders.filter((o) => o.status === f.id).length;
                            return (
                                <button key={f.id} onClick={() => setFilter(f.id)}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${filter === f.id
                                        ? "border-carbon bg-carbon text-white"
                                        : "border-line-strong bg-white text-mutedink hover:border-[#c9cdd6] hover:text-carbon"}`}>
                                    {f.label}
                                    <span className={`rounded-full px-1.5 text-[11px] ${filter === f.id ? "bg-white/15" : "bg-surface-2"}`}>{n}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-3">
                        {shown.map((o) => <OrderRow key={o.id} order={o} />)}
                        {shown.length === 0 && (
                            <div className={`${cardCls} px-6 py-12 text-center text-sm text-mutedink`}>No orders in this view.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function OrderRow({ order: o }: { order: ApiOrder }) {
    const units = o.items.reduce((n, i) => n + i.quantity, 0);
    return (
        <Link href={`/account/orders/${o.id}`}
            className={`${cardCls} group block p-5 transition hover:border-line-strong hover:shadow-[0_1px_2px_rgba(20,22,28,.04),0_16px_32px_-20px_rgba(20,22,28,.3)]`}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-mono text-[14px] font-semibold text-carbon">{o.orderNumber}</span>
                <StatusBadge status={o.status} />
                <span className="text-[12.5px] text-faint">{orderDate(o.createdAt)}</span>
                <ChevronRight size={18} className="ml-auto text-line-strong transition group-hover:translate-x-0.5 group-hover:text-brand" />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {o.items.slice(0, 3).map((i) => (
                            <span key={i.id} className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border-2 border-white bg-surface">
                                {i.image
                                    ? <Image src={i.image} alt="" width={44} height={44} className="h-full w-full object-contain p-1" />
                                    : <Package size={18} className="text-line-strong" />}
                            </span>
                        ))}
                        {o.items.length > 3 && (
                            <span className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-white bg-surface-2 text-[12px] font-semibold text-mutedink">
                                +{o.items.length - 3}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="max-w-[320px] truncate text-[13.5px] font-medium text-carbon">
                            {o.items[0]?.name}{o.items.length > 1 ? ` and ${o.items.length - 1} more` : ""}
                        </p>
                        <p className="text-[12.5px] text-faint">
                            {units} item{units === 1 ? "" : "s"} · {PAYMENT_METHOD_LABEL[o.paymentMethod ?? ""] ?? "—"} · <PaymentLabel status={o.paymentStatus} />
                        </p>
                    </div>
                </div>
                <span className="font-mono text-[16px] font-semibold text-carbon">{money(o.total)}</span>
            </div>
        </Link>
    );
}

function EmptyState() {
    return (
        <div className={`${cardCls} overflow-hidden`}>
            <div className="flex flex-col items-center px-6 py-16 text-center sm:py-20">
                <div className="relative">
                    <span className="absolute inset-0 -m-3 rounded-[28px] bg-brand-wash" />
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand shadow-[0_8px_24px_-12px_rgba(20,22,28,.35)]">
                        <Package size={28} />
                    </span>
                </div>
                <h3 className="mt-7 font-display text-xl font-extrabold tracking-[-0.01em] text-carbon">No orders yet</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-mutedink">
                    When you place an order it will appear here with live status and tracking details.
                </p>
                <Link href="/shop" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(228,83,31,0.65)] transition hover:bg-brand-hover">
                    <Search size={16} /> Browse parts
                </Link>
            </div>
            <div className="grid grid-cols-1 divide-y divide-line border-t border-line bg-surface sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {[
                    { icon: Truck, title: "Fast dispatch", text: "Same-day in Nairobi, countrywide delivery." },
                    { icon: ShieldCheck, title: "Genuine parts guarantee", text: "Every order is verified before it ships." },
                ].map((f) => (
                    <div key={f.title} className="flex items-start gap-3 px-6 py-5">
                        <f.icon size={18} className="mt-0.5 shrink-0 text-brand" />
                        <div>
                            <p className="text-[13.5px] font-semibold text-carbon">{f.title}</p>
                            <p className="text-[12.5px] text-mutedink">{f.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
