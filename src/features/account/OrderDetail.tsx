'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarClock, Check, CheckCircle2, CreditCard, Loader2, MapPin, Package, Phone, Truck } from "lucide-react";
import { orderApi, type ApiOrder } from "@/lib/api";
import { getToken } from "@/features/auth/token";
import { AuthError } from "@/features/auth/AuthFields";
import { cardCls } from "./AccountShell";
import OrderReturns from "./OrderReturns";
import MpesaPayment from "@/features/checkout/MpesaPayment";
import {
    StatusBadge, PaymentLabel, PAYMENT_METHOD_LABEL, TRACK_STEPS, money, orderDate, statusLabel,
} from "./orderStatus";

export default function OrderDetail() {
    const { id } = useParams<{ id: string }>();
    const params = useSearchParams();
    const justPlaced = params.get("placed") === "1";
    const justReturned = params.get("return");
    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0); // refetch after a cancel

    useEffect(() => {
        const token = getToken();
        if (!token || !id) return;
        let live = true;
        orderApi.get(token, id)
            .then((o) => live && setOrder(o))
            .catch((e: unknown) => live && setError(e instanceof Error ? e.message : "Couldn't load this order."));
        return () => { live = false; };
    }, [id, reloadKey]);

    const back = (
        <Link href="/account/orders" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-mutedink transition hover:text-carbon">
            <ArrowLeft size={15} /> All orders
        </Link>
    );

    if (error) return <div>{back}<AuthError>{error}</AuthError></div>;
    if (!order) {
        return (
            <div>{back}
                <div className={`${cardCls} flex items-center justify-center py-24 text-faint`}><Loader2 size={22} className="animate-spin" /></div>
            </div>
        );
    }

    const addr = order.shippingAddress;
    // older orders recorded the delivery option in the note
    const delivery = order.deliveryZoneName ?? order.customerNote?.match(/^Delivery: ([^—]+)/)?.[1]?.trim();
    const awaitingPayment = order.paymentMethod === "mpesa" && order.status === "PENDING" && order.paymentStatus !== "PAID";
    const receipt = order.payments?.find((p) => p.status === "SUCCESS")?.receiptNumber;

    return (
        <div className="animate-in fade-in duration-300">
            {back}

            {justPlaced && !awaitingPayment && (
                <div className="mb-6 flex items-start gap-4 rounded-2xl border border-[#cfe9dc] bg-stock-wash p-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-stock">
                        <CheckCircle2 size={24} />
                    </span>
                    <div>
                        <p className="font-display text-[17px] font-bold text-carbon">Thank you — your order is confirmed!</p>
                        <p className="mt-0.5 text-[13.5px] text-mutedink">
                            We&apos;ve received order <span className="font-mono font-semibold text-carbon">{order.orderNumber}</span>
                            {order.paymentStatus === "PAID" ? " and your payment." : ". You'll pay on delivery."}
                        </p>
                    </div>
                </div>
            )}

            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[12.5px] text-faint">Placed {orderDate(order.createdAt, true)}</p>
                    <h2 className="mt-1 flex flex-wrap items-center gap-3 font-display text-[22px] font-extrabold tracking-[-0.02em] text-carbon">
                        <span className="font-mono">{order.orderNumber}</span>
                        <StatusBadge status={order.status} />
                    </h2>
                </div>
                <span className="font-mono text-2xl font-semibold text-carbon">{money(order.total)}</span>
            </div>

            {awaitingPayment && (
                <div className={`${cardCls} mb-6 px-6 py-7`}>
                    <p className="mb-5 text-center text-[13px] font-semibold uppercase tracking-wide text-faint">Complete your payment</p>
                    <MpesaPayment orderId={order.id} defaultPhone={addr.phone} onPaid={() => setReloadKey((k) => k + 1)} />
                </div>
            )}

            <Tracker status={order.status} />

            <OrderReturns orderId={order.id} justReturned={justReturned} onChanged={() => setReloadKey((k) => k + 1)} />

            {order.status === "SHIPPED" && (order.trackingCarrier || order.estimatedDeliveryAt) && (
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-[#f3d9cc] bg-brand-wash px-5 py-4 text-[13.5px]">
                    {order.trackingCarrier && (
                        <span className="inline-flex items-center gap-2 text-carbon">
                            <Truck size={17} className="text-brand" />
                            With <span className="font-semibold">{order.trackingCarrier}</span>
                            {order.trackingNumber && <span className="font-mono text-mutedink">· {order.trackingNumber}</span>}
                        </span>
                    )}
                    {order.estimatedDeliveryAt && (
                        <span className="inline-flex items-center gap-2 text-carbon">
                            <CalendarClock size={17} className="text-brand" />
                            Expected <span className="font-semibold">{new Date(order.estimatedDeliveryAt).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "short" })}</span>
                        </span>
                    )}
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
                {/* items + totals */}
                <div className={cardCls}>
                    <div className="border-b border-line px-6 py-4">
                        <h3 className="font-display text-base font-bold text-carbon">Items ({order.items.length})</h3>
                    </div>
                    <ul className="divide-y divide-line px-6">
                        {order.items.map((i) => (
                            <li key={i.id} className="flex items-center gap-4 py-4">
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface">
                                    {i.image
                                        ? <Image src={i.image} alt={i.name} width={56} height={56} className="h-full w-full object-contain p-1.5" />
                                        : <Package size={20} className="text-line-strong" />}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[14px] font-semibold text-carbon">{i.name}</p>
                                    <p className="text-[12.5px] text-faint">SKU {i.sku} · {i.quantity} × {money(i.unitPrice)}</p>
                                </div>
                                <span className="font-mono text-[14px] font-semibold text-carbon">{money(i.subtotal)}</span>
                            </li>
                        ))}
                    </ul>
                    <dl className="space-y-2.5 border-t border-line bg-surface px-6 py-5 text-[13.5px]">
                        <div className="flex justify-between text-mutedink"><dt>Subtotal</dt><dd className="font-mono">{money(order.subtotal)}</dd></div>
                        <div className="flex justify-between text-mutedink">
                            <dt>Delivery</dt>
                            <dd className={Number(order.shippingAmount) === 0 ? "font-semibold text-stock" : "font-mono"}>
                                {Number(order.shippingAmount) === 0 ? "Free" : money(order.shippingAmount)}
                            </dd>
                        </div>
                        {Number(order.taxAmount ?? 0) > 0 && (
                            <div className="flex justify-between text-mutedink">
                                <dt>VAT{order.taxRate != null ? ` (${Number(order.taxRate)}%)` : ""}</dt><dd className="font-mono">{money(order.taxAmount)}</dd>
                            </div>
                        )}
                        {Number(order.discountAmount) > 0 && (
                            <div className="flex justify-between text-mutedink"><dt>Discount</dt><dd className="font-mono">−{money(order.discountAmount)}</dd></div>
                        )}
                        <div className="flex justify-between border-t border-line pt-3 text-[15px] font-bold text-carbon">
                            <dt>Total</dt><dd className="font-mono">{money(order.total)}</dd>
                        </div>
                    </dl>
                </div>

                <div className="space-y-6">
                    <InfoCard icon={MapPin} title="Delivery">
                        <p className="font-semibold text-carbon">{addr.fullName}</p>
                        <p>{addr.line1}</p>
                        {addr.line2 && <p>Near {addr.line2}</p>}
                        <p>{addr.city}, {addr.country}</p>
                        {addr.phone && <p className="mt-2 inline-flex items-center gap-1.5"><Phone size={13} /> {addr.phone}</p>}
                        {delivery && <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-[12.5px] font-medium text-carbon">{delivery}</p>}
                        {order.trackingNumber && (
                            <p className="mt-2 text-[12.5px]">Tracking: <span className="font-mono font-semibold text-carbon">{order.trackingCarrier} {order.trackingNumber}</span></p>
                        )}
                    </InfoCard>

                    <InfoCard icon={CreditCard} title="Payment">
                        <div className="flex justify-between"><span>Method</span><span className="font-semibold text-carbon">{PAYMENT_METHOD_LABEL[order.paymentMethod ?? ""] ?? "—"}</span></div>
                        <div className="mt-1.5 flex justify-between"><span>Status</span><PaymentLabel status={order.paymentStatus} /></div>
                        {receipt && (
                            <div className="mt-1.5 flex justify-between"><span>M-Pesa receipt</span><span className="font-mono font-semibold text-carbon">{receipt}</span></div>
                        )}
                    </InfoCard>

                    <Link href={`/contact-us?topic=${encodeURIComponent("Order / delivery")}&order=${encodeURIComponent(order.orderNumber)}`}
                        className="flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4 text-[13.5px] font-semibold text-carbon transition hover:border-brand hover:text-brand-ink">
                        Need help with this order?
                        <span className="text-brand">Contact us →</span>
                    </Link>

                    {!!order.statusHistory?.length && (
                        <InfoCard title="Tracking history">
                            <ol className="relative space-y-4 border-l border-line pl-5">
                                {order.statusHistory.map((h) => (
                                    <li key={h.id} className="relative">
                                        <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand ring-1 ring-line" />
                                        <p className="text-[13px] font-semibold text-carbon">{h.note || statusLabel(h.status)}</p>
                                        {h.location && (
                                            <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-mutedink"><MapPin size={12} /> {h.location}</p>
                                        )}
                                        <p className="text-[12px] text-faint">{orderDate(h.createdAt, true)}</p>
                                    </li>
                                ))}
                            </ol>
                        </InfoCard>
                    )}
                </div>
            </div>
        </div>
    );
}

function Tracker({ status }: { status: string }) {
    if (status === "CANCELLED" || status === "REFUNDED") {
        return (
            <div className={`${cardCls} px-6 py-5 text-[13.5px] text-mutedink`}>
                This order was <span className="font-semibold text-carbon">{statusLabel(status).toLowerCase()}</span>.
            </div>
        );
    }
    const current = TRACK_STEPS.indexOf(status as (typeof TRACK_STEPS)[number]); // -1 for PENDING
    return (
        <div className={`${cardCls} px-6 py-6`}>
            <ol className="grid grid-cols-4">
                {TRACK_STEPS.map((s, i) => {
                    const done = i <= current;
                    return (
                        <li key={s} className="relative flex flex-col items-center text-center">
                            {i > 0 && (
                                <span className={`absolute right-1/2 top-[15px] h-0.5 w-full ${i <= current ? "bg-brand" : "bg-line"}`} />
                            )}
                            <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[12px] font-bold transition ${done
                                ? "border-brand bg-brand text-white"
                                : "border-line-strong bg-white text-faint"} ${i === current ? "ring-4 ring-brand/15" : ""}`}>
                                {done ? <Check size={15} strokeWidth={3} /> : i + 1}
                            </span>
                            <span className={`mt-2 text-[12px] font-semibold sm:text-[13px] ${done ? "text-carbon" : "text-faint"}`}>{statusLabel(s)}</span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

function InfoCard({ icon: Icon, title, children }: { icon?: typeof MapPin; title: string; children: React.ReactNode }) {
    return (
        <div className={cardCls}>
            <div className="flex items-center gap-2 border-b border-line px-6 py-4">
                {Icon && <Icon size={16} className="text-brand" />}
                <h3 className="font-display text-base font-bold text-carbon">{title}</h3>
            </div>
            <div className="px-6 py-5 text-[13.5px] leading-relaxed text-mutedink">{children}</div>
        </div>
    );
}
