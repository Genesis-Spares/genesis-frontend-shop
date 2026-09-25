'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Lock, MapPin, ShoppingCart, Truck } from 'lucide-react'
import Logo from '@/components/common/Logo'
import Footer from '@/components/common/Footer'
import { useCart } from '@/features/cart/CartContext'
import { useAuth } from '@/features/auth/AuthContext'
import { getToken } from '@/features/auth/token'
import { AuthError } from '@/features/auth/AuthFields'
import { deliveryEta, orderApi, townNames, type CheckoutBody, type PaymentView } from '@/lib/api'
import { formatKSh } from '@/libs/utils'
import MpesaPayment from './MpesaPayment'
import { rememberTown, rememberedTown, useDeliveryZones, useQuote } from './useQuote'

type PayId = CheckoutBody['paymentMethod']

const payments: { id: PayId; label: string; sub: string }[] = [
    { id: 'mpesa', label: 'M-PESA', sub: 'STK push to your phone' },
    { id: 'cod', label: 'On Delivery', sub: 'Cash / POS' },
]

const fieldCls =
    'h-[46px] w-full rounded-lg border border-line-strong bg-white px-3.5 text-sm text-carbon outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10'
const labelCls = 'mb-1.5 block text-[12.5px] font-semibold text-mutedink'

type Phase = 'idle' | 'placing' | 'awaiting-payment' | 'done'

export default function CheckoutPage() {
    const router = useRouter()
    const { user, ready: authReady } = useAuth()
    const { items, subtotal, clear, ready: cartReady } = useCart()

    const [pay, setPay] = useState<PayId>('mpesa')
    const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '', landmark: '' })
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [phase, setPhase] = useState<Phase>('idle')
    const [error, setError] = useState<string | null>(null)
    const [placed, setPlaced] = useState<{ id: string; payment: PaymentView | null } | null>(null)

    const zones = useDeliveryZones()
    const towns = useMemo(() => townNames(zones?.zones ?? []), [zones])
    const lines = useMemo(() => items.map((i) => ({ productId: i.id, quantity: i.qty })), [items])
    const { quote, loading: quoting, error: quoteError } = useQuote(lines, form.city)

    // checkout needs an account so the order lands in "My orders"
    useEffect(() => {
        if (authReady && !user) router.replace('/account/login?redirect=/checkout')
    }, [authReady, user, router])

    // prefill from the signed-in profile once it's available
    useEffect(() => {
        if (!user) return
        const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
        setForm((f) => ({ ...f, fullName: f.fullName || name, phone: f.phone || user.phone || '' }))
    }, [user])

    // the town the shopper priced on the cart page
    useEffect(() => {
        const town = rememberedTown()
        if (town) setForm((f) => (f.city ? f : { ...f, city: town }))
    }, [])

    // pay on delivery only where the delivery zone allows it
    const codAllowed = !!quote?.zone.allowsCod
    useEffect(() => {
        if (quote && !quote.zone.allowsCod && pay === 'cod') setPay('mpesa')
    }, [quote, pay])

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }))

    const payPhone = mpesaPhone || form.phone
    const pricesChanged = !!quote && Math.abs(quote.subtotal - subtotal) >= 1

    const goToOrder = useCallback((id: string) => {
        setPhase('done')
        setTimeout(() => router.replace(`/account/orders/${id}?placed=1`), 900)
    }, [router])
    const onPaid = useCallback(() => placed && goToOrder(placed.id), [placed, goToOrder])

    const placeOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = getToken()
        if (!token) return router.replace('/account/login?redirect=/checkout')
        if (items.length === 0) return

        setError(null)
        setPhase('placing')
        try {
            const order = await orderApi.place(token, {
                items: lines,
                fullName: form.fullName,
                phone: pay === 'mpesa' ? payPhone : form.phone,
                address: form.address,
                city: form.city,
                landmark: form.landmark || undefined,
                paymentMethod: pay,
            })
            rememberTown(form.city)
            // the order now holds the parts (and the server cart is emptied), even while payment is pending
            clear()
            if (order.paymentMethod === 'mpesa' && order.paymentStatus !== 'PAID') {
                setPlaced({ id: order.id, payment: order.payment })
                setPhase('awaiting-payment')
            } else {
                goToOrder(order.id)
            }
        } catch (err: unknown) {
            setPhase('idle')
            setError(err instanceof Error ? err.message : 'We couldn’t place your order. Please try again.')
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    if (!authReady || !user || !cartReady) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface text-faint">
                <Loader2 size={22} className="animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-surface">
            {/* slim secure header */}
            <header className="sticky top-0 z-40 border-b border-line bg-white">
                <div className="mx-auto flex h-[70px] max-w-[1400px] items-center px-4 sm:px-6">
                    <Link href="/">
                        <Logo withMark />
                    </Link>
                    <div className="ml-auto flex items-center gap-2 text-[12.5px] text-faint">
                        <Lock size={14} /> Secure Checkout
                    </div>
                </div>
            </header>

            <form onSubmit={placeOrder} className="mx-auto max-w-[1400px] px-4 sm:px-6">
                {/* steps */}
                <div className="flex items-center justify-center gap-4 pb-1.5 pt-7">
                    <Step n="1" label="Delivery" active />
                    <span className="h-0.5 w-11 bg-brand" />
                    <Step n="2" label="Payment" active />
                    <span className={`h-0.5 w-11 ${phase === 'done' ? 'bg-brand' : 'bg-line-strong'}`} />
                    <Step n="3" label="Confirmation" active={phase === 'done'} />
                </div>

                <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-[1fr_380px]">
                    <div>
                        {error && <AuthError>{error}</AuthError>}

                        {/* delivery details */}
                        <section className="mb-4 rounded-2xl border border-hairline bg-white p-6">
                            <div className="font-display mb-5 text-lg font-extrabold text-carbon">Delivery Details</div>
                            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelCls} htmlFor="nm">Full name</label>
                                    <input id="nm" required autoComplete="name" className={fieldCls} value={form.fullName} onChange={set('fullName')} />
                                </div>
                                <div>
                                    <label className={labelCls} htmlFor="ph">Phone</label>
                                    <input id="ph" required type="tel" autoComplete="tel" className={fieldCls} value={form.phone}
                                        onChange={set('phone')} placeholder="0712 345 678" />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className={labelCls} htmlFor="ad">Delivery address</label>
                                <input id="ad" required autoComplete="street-address" className={fieldCls} value={form.address}
                                    onChange={set('address')} placeholder="Estate, street, building / house no." />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelCls} htmlFor="ct">City / Town</label>
                                    <input id="ct" required autoComplete="address-level2" list="genesis-towns" className={fieldCls} value={form.city}
                                        onChange={set('city')} placeholder="e.g. Nairobi, Nakuru, Mombasa" />
                                    <datalist id="genesis-towns">
                                        {towns.map((t) => <option key={t} value={t} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label className={labelCls} htmlFor="lm">Nearest landmark <span className="font-normal text-faint">(optional)</span></label>
                                    <input id="lm" className={fieldCls} value={form.landmark} onChange={set('landmark')} placeholder="e.g. Yaya Centre" />
                                </div>
                            </div>
                        </section>

                        {/* delivery — priced from the town */}
                        <section className="mb-4 rounded-2xl border border-hairline bg-white p-6">
                            <div className="font-display mb-4 text-lg font-extrabold text-carbon">Delivery</div>
                            {form.city.trim().length < 2 ? (
                                <p className="flex items-center gap-2 text-[13px] text-faint"><MapPin size={15} /> Enter your town above to see delivery options and fees.</p>
                            ) : quoteError ? (
                                <p className="text-[13px] font-medium text-[#b23b32]">{quoteError}</p>
                            ) : !quote ? (
                                <p className="flex items-center gap-2 text-[13px] text-faint"><Loader2 size={15} className="animate-spin" /> Checking delivery to {form.city.trim()}…</p>
                            ) : (
                                <div className="flex items-center gap-3.5 rounded-xl border-[1.5px] border-brand bg-brand-wash px-4 py-3.5">
                                    <Truck size={20} className="shrink-0 text-brand" />
                                    <span className="flex-1">
                                        <span className="block text-sm font-semibold text-carbon">{quote.zone.name}</span>
                                        <span className="block text-[12.5px] text-faint">
                                            {deliveryEta(quote.zone)}{quote.weightKg > 0 ? ` · ${quote.weightKg} kg` : ''}
                                        </span>
                                    </span>
                                    <span className={`text-sm font-bold ${quote.shipping === 0 ? 'text-stock' : 'text-carbon'} tnum`}>
                                        {quote.shipping === 0 ? 'Free' : formatKSh(quote.shipping)}
                                    </span>
                                </div>
                            )}
                            {quote?.amountToFreeDelivery != null && (
                                <p className="mt-3 text-[12.5px] text-mutedink">
                                    Add <span className="font-semibold text-carbon">{formatKSh(quote.amountToFreeDelivery)}</span> more for free delivery to {form.city.trim()}.
                                </p>
                            )}
                        </section>

                        {/* payment */}
                        <section className="rounded-2xl border border-hairline bg-white p-6">
                            <div className="font-display mb-4 text-lg font-extrabold text-carbon">Payment</div>
                            <div className="mb-4 grid grid-cols-2 gap-3">
                                {payments.map((p) => {
                                    const disabled = p.id === 'cod' && !codAllowed
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => setPay(p.id)}
                                            aria-pressed={pay === p.id}
                                            className={`rounded-xl border px-2 py-4 text-center transition disabled:cursor-not-allowed disabled:opacity-40 ${pay === p.id ? 'border-[1.5px] border-brand bg-brand-wash' : 'border-line-strong hover:border-[#c9cdd6]'
                                                }`}
                                        >
                                            <div
                                                className={`text-sm font-semibold ${p.id === 'mpesa' ? 'font-display font-extrabold text-stock' : 'text-mutedink'
                                                    }`}
                                            >
                                                {p.label}
                                            </div>
                                            <div className="mt-1 text-[11.5px] text-faint">{p.sub}</div>
                                        </button>
                                    )
                                })}
                            </div>
                            {pay === 'mpesa' && (
                                <>
                                    <label className={labelCls} htmlFor="mp">M-Pesa phone number</label>
                                    <input id="mp" type="tel" className={`${fieldCls} mb-1.5`} value={payPhone}
                                        onChange={(e) => setMpesaPhone(e.target.value)} placeholder="0712 345 678" />
                                    <div className="text-xs text-faint">
                                        After you place the order you&apos;ll get an M-Pesa prompt on this phone — enter your PIN to pay.
                                    </div>
                                </>
                            )}
                            {pay === 'cod' && (
                                <div className="text-[13px] text-faint">
                                    Pay with cash or card when your parts arrive.
                                </div>
                            )}
                            {quote && !codAllowed && (
                                <div className="mt-3 text-[12.5px] text-faint">Pay on delivery isn&apos;t available for {quote.zone.name}.</div>
                            )}
                        </section>
                    </div>

                    {/* order summary */}
                    <div>
                        <div className="rounded-2xl border border-hairline bg-white p-6 lg:sticky lg:top-[94px]">
                            <div className="font-display mb-4 text-lg font-extrabold text-carbon">Your Order</div>
                            {items.length === 0 && (
                                <div className="mb-3.5 flex items-center gap-3 text-[13px] text-faint">
                                    <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg bg-surface">
                                        <ShoppingCart size={22} className="text-line-strong" />
                                    </span>
                                    Your cart is empty — <Link href="/shop" className="font-semibold text-brand-ink">add parts</Link>
                                </div>
                            )}
                            {items.map((i) => (
                                <div key={i.id} className="mb-3.5 flex items-center gap-3">
                                    <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-visible rounded-lg bg-surface">
                                        {i.image ? (
                                            <Image src={i.image} alt={i.name} width={52} height={52} className="h-full w-full object-contain p-1" />
                                        ) : (
                                            <ShoppingCart size={24} strokeWidth={1.3} className="text-line-strong" />
                                        )}
                                        <span className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-carbon text-[10px] font-bold text-white">
                                            {i.qty}
                                        </span>
                                    </div>
                                    <div className="flex-1 text-[12.5px] font-semibold leading-tight text-carbon">
                                        {i.name}
                                    </div>
                                    <div className="font-mono text-[13px] font-semibold text-carbon tnum">
                                        {formatKSh(i.price * i.qty)}
                                    </div>
                                </div>
                            ))}
                            <div className="mt-2 border-t border-line pt-4">
                                <div className="mb-2.5 flex justify-between text-[13.5px] text-mutedink">
                                    Subtotal<span className="font-mono tnum">{formatKSh(quote?.subtotal ?? subtotal)}</span>
                                </div>
                                <div className="mb-2.5 flex justify-between text-[13.5px] text-mutedink">
                                    Delivery
                                    <span className={quote?.shipping === 0 ? 'text-stock' : 'tnum'}>
                                        {!quote ? '—' : quote.shipping === 0 ? 'Free' : formatKSh(quote.shipping)}
                                    </span>
                                </div>
                                <div className="mb-2.5 flex justify-between text-[13.5px] text-mutedink">
                                    VAT{zones || quote ? ` (${quote?.taxRate ?? zones?.vatRate}%)` : ''}
                                    <span className="font-mono tnum">{quote ? formatKSh(quote.taxAmount) : '—'}</span>
                                </div>
                                <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3.5">
                                    <span className="text-[15px] font-bold text-carbon">Total</span>
                                    <span className="font-display text-[22px] font-extrabold text-carbon tnum">
                                        {quote ? formatKSh(quote.total) : '—'}
                                    </span>
                                </div>
                                {pricesChanged && (
                                    <p className="mt-2 text-[11.5px] text-[#9a5b00]">Some prices changed since you added these parts — the totals above are current.</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={items.length === 0 || phase !== 'idle' || !quote || quoting}
                                className="font-display mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand text-base font-extrabold text-white shadow-[0_8px_20px_-8px_rgba(228,83,31,0.65)] transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                            >
                                <Lock size={16} />
                                {!quote ? 'Place order' : pay === 'cod' ? `Place order · ${formatKSh(quote.total)}` : `Pay ${formatKSh(quote.total)} with M-Pesa`}
                            </button>
                            <div className="mt-3 text-center text-[11.5px] text-faint">
                                Prices are confirmed against our catalogue when you place the order. By placing it you agree to our{' '}
                                <Link href="/terms" target="_blank" className="underline underline-offset-2 hover:text-carbon">Terms</Link>,{' '}
                                <Link href="/returns" target="_blank" className="underline underline-offset-2 hover:text-carbon">Returns</Link> and{' '}
                                <Link href="/delivery" target="_blank" className="underline underline-offset-2 hover:text-carbon">Delivery</Link> policies.
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <Footer />

            {phase !== 'idle' && (
                <Modal>
                    {phase === 'awaiting-payment' && placed ? (
                        <>
                            <MpesaPayment orderId={placed.id} initial={placed.payment} defaultPhone={payPhone} onPaid={onPaid} />
                            <Link href={`/account/orders/${placed.id}`} className="mt-5 block text-center text-[12.5px] font-semibold text-mutedink underline-offset-2 hover:text-carbon hover:underline">
                                I&apos;ll pay later from My orders
                            </Link>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${phase === 'done' ? 'bg-stock-wash text-stock' : 'bg-brand-wash text-brand'}`}>
                                {phase === 'done' ? <CheckCircle2 size={30} /> : <Truck size={28} />}
                            </div>
                            <h2 className="mt-5 font-display text-xl font-extrabold text-carbon">{phase === 'done' ? 'Order placed!' : 'Placing your order'}</h2>
                            <p className="mt-2 text-[13.5px] leading-relaxed text-mutedink">
                                {phase === 'done' ? 'Taking you to your order…' : 'Confirming stock and reserving your parts.'}
                            </p>
                            {phase !== 'done' && <Loader2 size={22} className="mx-auto mt-6 animate-spin text-brand" />}
                        </div>
                    )}
                </Modal>
            )}
        </div>
    )
}

function Modal({ children }: { children: React.ReactNode }) {
    return (
        <div role="dialog" aria-modal="true" aria-live="polite"
            className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95">{children}</div>
        </div>
    )
}

function Step({ n, label, active }: { n: string; label: string; active?: boolean }) {
    return (
        <div className={`flex items-center gap-2.5 text-[13.5px] font-semibold ${active ? 'text-carbon' : 'text-faint'}`}>
            <span
                className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-[13px] font-bold ${active ? 'bg-brand text-white' : 'border border-line-strong bg-white text-faint'
                    }`}
            >
                {n}
            </span>
            {label}
        </div>
    )
}
