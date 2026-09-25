'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Minus, Plus, Lock, Truck, ShoppingCart } from 'lucide-react'
import Topbar from '@/components/common/Topbar'
import MainHeader from '@/components/common/MainHeader'
import NavBar from '@/components/common/NavBar'
import Footer from '@/components/common/Footer'
import { useCart } from '@/features/cart/CartContext'
import { formatKSh } from '@/libs/utils'

const FREE_DELIVERY_THRESHOLD = 10000

export default function CartPage() {
    const { items, count, subtotal, setQty, remove, ready } = useCart()

    const freeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0
    const empty = ready && items.length === 0

    return (
        <div className="min-h-screen bg-white">
            <Topbar />
            <MainHeader />
            <NavBar />

            <main className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <div className="pt-8">
                    <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-carbon">
                        Your Cart{' '}
                        <span className="text-lg font-medium text-faint">
                            ({count} item{count !== 1 ? 's' : ''})
                        </span>
                    </h1>
                </div>

                {empty ? (
                    <div className="my-10 flex flex-col items-center justify-center rounded-2xl border border-hairline bg-surface p-16 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                            <ShoppingCart size={28} className="text-line-strong" />
                        </span>
                        <h2 className="font-display mt-5 text-xl font-extrabold text-carbon">Your cart is empty</h2>
                        <p className="mt-2 text-sm text-faint">Browse the catalogue and add the parts you need.</p>
                        <Link href="/shop" className="mt-6 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-hover">
                            Start shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 py-7 lg:grid-cols-[1fr_380px]">
                        {/* lines */}
                        <div>
                            {!ready && (
                                <div className="mb-4 h-28 animate-pulse rounded-2xl border border-hairline bg-surface" />
                            )}
                            {items.map((l) => (
                                <div
                                    key={l.id}
                                    className="mb-4 flex items-center gap-4 rounded-2xl border border-hairline bg-white p-4 sm:p-5"
                                >
                                    <Link href={`/products/${l.slug}`} className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface">
                                        {l.image ? (
                                            <Image src={l.image} alt={l.name} width={96} height={96} className="h-full w-full object-contain p-2" />
                                        ) : (
                                            <ShoppingCart size={40} strokeWidth={1.2} className="text-line-strong" />
                                        )}
                                    </Link>
                                    <div className="min-w-0 flex-1">
                                        {l.brand && (
                                            <div className="font-mono text-[11.5px] font-semibold text-faint">
                                                {l.brand} · {l.sku}
                                            </div>
                                        )}
                                        <Link href={`/products/${l.slug}`} className="my-1.5 block text-[15px] font-semibold text-carbon hover:text-brand">
                                            {l.name}
                                        </Link>
                                        {l.maxQty !== undefined && l.maxQty <= 5 ? (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-brand-ink">
                                                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Only {l.maxQty} left
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-stock">
                                                <span className="h-1.5 w-1.5 rounded-full bg-stock" /> In stock · Same-day dispatch
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center overflow-hidden rounded-lg border border-line-strong">
                                        <button
                                            onClick={() => setQty(l.id, l.qty - 1)}
                                            aria-label="Decrease"
                                            className="flex h-[42px] w-9 items-center justify-center bg-surface text-mutedink hover:text-carbon"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-10 text-center font-bold tnum">{l.qty}</span>
                                        <button
                                            onClick={() => setQty(l.id, l.qty + 1)}
                                            disabled={l.maxQty !== undefined && l.qty >= l.maxQty}
                                            aria-label="Increase"
                                            className="flex h-[42px] w-9 items-center justify-center bg-surface text-mutedink hover:text-carbon disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="w-28 text-right">
                                        <div className="font-display text-[17px] font-extrabold text-carbon tnum">
                                            {formatKSh(l.price * l.qty)}
                                        </div>
                                        <button
                                            onClick={() => remove(l.id)}
                                            className="mt-1.5 text-xs text-faint hover:text-brand-ink"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <Link
                                href="/shop"
                                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-ink hover:gap-3 transition-all"
                            >
                                <ArrowLeft size={16} /> Continue shopping
                            </Link>
                        </div>

                        {/* summary */}
                        <div>
                            <div className="rounded-2xl border border-hairline bg-white p-6">
                                <div className="font-display mb-5 text-lg font-extrabold text-carbon">Order Summary</div>
                                <div className="mb-3 flex justify-between text-sm text-mutedink">
                                    Subtotal
                                    <span className="font-mono font-semibold text-carbon tnum">{formatKSh(subtotal)}</span>
                                </div>
                                <div className="mb-3 flex justify-between text-sm text-mutedink">
                                    Delivery<span className="font-semibold text-stock">{freeDelivery ? 'Free' : formatKSh(450)}</span>
                                </div>
                                <div className="mb-4 flex justify-between text-sm text-mutedink">
                                    VAT (16%)<span className="font-semibold text-carbon">Included</span>
                                </div>
                                <div className="mb-4 flex h-11 overflow-hidden rounded-lg border border-line-strong">
                                    <input
                                        placeholder="Promo code"
                                        aria-label="Promo code"
                                        className="flex-1 bg-surface px-3.5 text-sm outline-none placeholder:text-faint"
                                    />
                                    <button className="w-20 bg-white text-[13px] font-semibold text-mutedink hover:text-carbon">
                                        Apply
                                    </button>
                                </div>
                                <div className="mb-5 flex items-baseline justify-between border-t border-line pt-4">
                                    <span className="text-base font-bold text-carbon">Total</span>
                                    <span className="font-display text-2xl font-extrabold text-carbon tnum">
                                        {formatKSh(freeDelivery ? subtotal : subtotal + 450)}
                                    </span>
                                </div>
                                <Link
                                    href="/checkout"
                                    className="flex h-[52px] w-full items-center justify-center rounded-xl bg-brand font-semibold text-white transition hover:bg-brand-hover"
                                >
                                    Proceed to Checkout
                                </Link>
                                <div className="mt-3.5 flex items-center justify-center gap-2 text-xs text-faint">
                                    <Lock size={13} /> Secure checkout · M-Pesa &amp; card
                                </div>
                            </div>

                            {freeDelivery && subtotal > 0 && (
                                <div className="mt-3.5 flex items-center gap-3 rounded-xl border border-[#c7e8d6] bg-stock-wash px-4 py-3.5">
                                    <Truck size={20} className="shrink-0 text-stock" />
                                    <span className="text-[12.5px] font-medium text-stock">
                                        Free delivery unlocked on this order
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
