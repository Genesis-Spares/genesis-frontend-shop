'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Package, ShoppingCart, ArrowRight, ArrowUpRight, Mail, Phone, User, Headphones, Search } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { useCart } from "@/features/cart/CartContext";
import { PanelHeader, cardCls } from "./AccountShell";
import { orderApi, type ApiOrder } from "@/lib/api";
import { getToken } from "@/features/auth/token";
import { StatusBadge, money, orderDate } from "./orderStatus";

export default function AccountOverview() {
    const { user } = useAuth();
    const { count: wishCount } = useWishlist();
    const { count: cartCount } = useCart();
    const [recent, setRecent] = useState<{ orders: ApiOrder[]; total: number } | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) return;
        let live = true;
        orderApi.list(token, 1, 3)
            .then(({ items, meta }) => live && setRecent({ orders: items, total: meta?.total ?? items.length }))
            .catch(() => live && setRecent({ orders: [], total: 0 }));
        return () => { live = false; };
    }, []);

    const stats = [
        { href: "/account/orders", icon: Package, label: "Orders", value: recent ? recent.total : "–", sub: "Order history" },
        { href: "/wishlist", icon: Heart, label: "Wishlist", value: wishCount, sub: "Saved parts" },
        { href: "/cart", icon: ShoppingCart, label: "In cart", value: cartCount, sub: "Ready to checkout" },
    ];

    const details = [
        { icon: User, label: "Name", value: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—" },
        { icon: Mail, label: "Email", value: user?.email || "—" },
        { icon: Phone, label: "Phone", value: user?.phone || "Not added" },
    ];

    return (
        <div className="animate-in fade-in duration-300">
            <PanelHeader
                title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ""}`}
                subtitle="Here's a snapshot of your account activity."
            />

            {/* stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((s) => (
                    <Link key={s.href} href={s.href}
                        className={`${cardCls} group p-5 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_1px_2px_rgba(20,22,28,.04),0_16px_32px_-20px_rgba(20,22,28,.3)]`}>
                        <div className="flex items-center justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-wash text-brand">
                                <s.icon size={19} />
                            </span>
                            <ArrowUpRight size={17} className="text-line-strong transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
                        </div>
                        <div className="mt-5 font-mono text-[30px] font-semibold leading-none tracking-tight text-carbon">{s.value}</div>
                        <div className="mt-2 text-sm font-semibold text-carbon">{s.label}</div>
                        <div className="text-[12.5px] text-faint">{s.sub}</div>
                    </Link>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
                {/* recent orders */}
                <div className={cardCls}>
                    <div className="flex items-center justify-between border-b border-line px-6 py-4">
                        <h3 className="font-display text-base font-bold text-carbon">Recent orders</h3>
                        <Link href="/account/orders" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-ink hover:underline underline-offset-4">
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>
                    {recent && recent.orders.length > 0 ? (
                        <ul className="divide-y divide-line">
                            {recent.orders.map((o) => (
                                <li key={o.id}>
                                    <Link href={`/account/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-4 transition hover:bg-surface">
                                        <span className="font-mono text-[13.5px] font-semibold text-carbon">{o.orderNumber}</span>
                                        <StatusBadge status={o.status} />
                                        <span className="text-[12.5px] text-faint">{orderDate(o.createdAt)}</span>
                                        <span className="ml-auto font-mono text-[14px] font-semibold text-carbon">{money(o.total)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                    <div className="flex flex-col items-center px-6 py-12 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-faint">
                            <Package size={24} />
                        </span>
                        <p className="mt-4 text-[15px] font-semibold text-carbon">{recent ? "No orders yet" : "Loading orders…"}</p>
                        <p className="mt-1 max-w-xs text-[13px] text-mutedink">Your orders and their delivery status will appear here.</p>
                        <Link href="/shop" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-carbon px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-carbon-soft">
                            <Search size={15} /> Find parts
                        </Link>
                    </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* account details */}
                    <div className={cardCls}>
                        <div className="flex items-center justify-between border-b border-line px-6 py-4">
                            <h3 className="font-display text-base font-bold text-carbon">Account details</h3>
                            <Link href="/account/profile" className="text-[13px] font-semibold text-brand-ink hover:underline underline-offset-4">Edit</Link>
                        </div>
                        <dl className="divide-y divide-line px-6">
                            {details.map((d) => (
                                <div key={d.label} className="flex items-center gap-3 py-3.5">
                                    <d.icon size={16} className="shrink-0 text-faint" />
                                    <dt className="w-14 shrink-0 text-[12.5px] text-faint">{d.label}</dt>
                                    <dd className="min-w-0 truncate text-[13.5px] font-medium text-carbon">{d.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* help */}
                    <div className="relative overflow-hidden rounded-2xl bg-carbon p-6 text-white">
                        <div className="absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-brand/30 blur-[60px]" />
                        <Headphones size={22} className="relative text-brand" />
                        <p className="relative mt-3 font-display text-base font-bold">Not sure which part fits?</p>
                        <p className="relative mt-1 text-[13px] leading-relaxed text-white/60">Our parts experts will match the right part to your vehicle.</p>
                        <Link href="/contact-us" className="relative mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white hover:text-brand">
                            Talk to an expert <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
