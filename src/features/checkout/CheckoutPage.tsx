'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CheckCircle2, CreditCard, Info, Loader2, Lock, ShoppingCart, Smartphone, Truck } from 'lucide-react'
import Logo from '@/components/common/Logo'
import Footer from '@/components/common/Footer'
import { useCart } from '@/features/cart/CartContext'
import { useAuth } from '@/features/auth/AuthContext'
import { getToken } from '@/features/auth/token'
import { AuthError } from '@/features/auth/AuthFields'
import { orderApi, type CheckoutBody } from '@/lib/api'
import { formatKSh } from '@/libs/utils'

type ShipId = CheckoutBody['deliveryMethod']
type PayId = CheckoutBody['paymentMethod']

// fees mirror DELIVERY_METHODS in the gateway, which is the source of truth
const shipping: { id: ShipId; title: string; sub: string; fee: number }[] = [
    { id: 'same-day', title: 'Same-Day Delivery (Nairobi)', sub: 'Today by 6pm · dispatched from Industrial Area', fee: 0 },
    { id: 'courier', title: 'Countrywide Courier', sub: '2–3 business days · G4S / Wells Fargo', fee: 450 },
]

const payments: { id: PayId; label: string; sub: string }[] = [
    { id: 'mpesa', label: 'M-PESA', sub: 'STK push' },
    { id: 'card', label: 'Card', sub: 'Visa / MC' },
    { id: 'cod', label: 'On Delivery', sub: 'Cash / POS' },
]

const fieldCls =
    'h-[46px] w-full rounded-lg border border-line-strong bg-white px-3.5 text-sm text-carbon outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10'
const labelCls = 'mb-1.5 block text-[12.5px] font-semibold text-mutedink'

/** How long the fake payment processor "takes" — long enough to read the modal. */
const SIMULATED_PAYMENT_MS = 2200

type Phase = 'idle' | 'paying' | 'done'

export default function CheckoutPage() {
    const router = useRouter()
    const { user, ready: authReady } = useAuth()
    const { items, subtotal, clear, ready: cartReady } = useCart()

    const [ship, setShip] = useState<ShipId>('same-day')
    const [pay, setPay] = useState<PayId>('mpesa')
    const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: 'Nairobi', landmark: '' })
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [phase, setPhase] = useState<Phase>('idle')
    const [error, setError] = useState<string | null>(null)

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

    // pay-on-delivery is Nairobi same-day only
    useEffect(() => {
        if (ship === 'courier' && pay === 'cod') setPay('mpesa')
    }, [ship, pay])

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }))

    const deliveryFee = shipping.find((s) => s.id === ship)?.fee ?? 0
    const total = subtotal + deliveryFee
    const payPhone = mpesaPhone || form.phone

    const placeOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = getToken()
        if (!token) return router.replace('/account/login?redirect=/checkout')
        if (items.length === 0) return

        setError(null)
        setPhase('paying')
        try {
            const [order] = await Promise.all([
                orderApi.place(token, {
                    items: items.map((i) => ({ productId: i.id, quantity: i.qty })),
                    fullName: form.fullName,
                    phone: pay === 'mpesa' ? payPhone : form.phone,
                    address: form.address,
                    city: form.city,
                    landmark: form.landmark || undefined,
                    deliveryMethod: ship,
                    paymentMethod: pay,
                }),
                new Promise((r) => setTimeout(r, SIMULATED_PAYMENT_MS)),
            ])
            setPhase('done')
            clear()
            setTimeout(() => router.replace(`/account/orders/${order.id}?placed=1`), 900)
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

                <div className="mx-auto mt-4 flex max-w-3xl items-start gap-2.5 rounded-xl border border-[#cfdcf2] bg-[#f1f6fd] px-4 py-3 text-[13px] text-[#1f4f94]">
                    <Info size={16} className="mt-0.5 shrink-0" />
                    <span>
                        <strong className="font-semibold">Demo checkout:</strong> payments are simulated — no money is charged and no card
                        details are collected. Your order is created for real and appears under My orders.
                    </span>
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
                                    <input id="ct" required autoComplete="address-level2" className={fieldCls} value={form.city} onChange={set('city')} />
                                </div>
                                <div>
                                    <label className={labelCls} htmlFor="lm">Nearest landmark <span className="font-normal text-faint">(optional)</span></label>
                                    <input id="lm" className={fieldCls} value={form.landmark} onChange={set('landmark')} placeholder="e.g. Yaya Centre" />
                                </div>
                            </div>
                        </section>

                        {/* delivery method */}
                        <section className="mb-4 rounded-2xl border border-hairline bg-white p-6">
                            <div className="font-display mb-4 text-lg font-extrabold text-carbon">Delivery Method</div>
                            {shipping.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setShip(s.id)}
                                    aria-pressed={ship === s.id}
                                    className={`mb-3 flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition last:mb-0 ${ship === s.id ? 'border-[1.5px] border-brand bg-brand-wash' : 'border-line-strong hover:border-[#c9cdd6]'
                                        }`}
                                >
                                    <span
                                        className={`h-[18px] w-[18px] shrink-0 rounded-full ${ship === s.id ? 'border-[5px] border-brand bg-white' : 'border-2 border-line-strong'
                                            }`}
                                    />
                                    <span className="flex-1">
                                        <span className="block text-sm font-semibold text-carbon">{s.title}</span>
                                        <span className="block text-[12.5px] text-faint">{s.sub}</span>
                                    </span>
                                    <span className={`text-sm font-bold ${s.fee === 0 ? 'text-stock' : 'text-carbon'} tnum`}>
                                        {s.fee === 0 ? 'Free' : formatKSh(s.fee)}
                                    </span>
                                </button>
                            ))}
                        </section>

                        {/* payment */}
                        <section className="rounded-2xl border border-hairline bg-white p-6">
                            <div className="font-display mb-4 text-lg font-extrabold text-carbon">Payment</div>
                            <div className="mb-4 grid grid-cols-3 gap-3">
                                {payments.map((p) => {
                                    const disabled = p.id === 'cod' && ship !== 'same-day'
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
                                        You&apos;ll receive a prompt on your phone to confirm payment. (Simulated in this demo.)
                                    </div>
                                </>
                            )}
                            {pay === 'card' && (
                                <div className="text-[13px] text-faint">
                                    In production you&apos;d be redirected to our secure card processor. In this demo the card payment is simulated.
                                </div>
                            )}
                            {pay === 'cod' && (
                                <div className="text-[13px] text-faint">
                                    Pay with cash or card on delivery. Available within Nairobi only.
                                </div>
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
                                    Subtotal<span className="font-mono tnum">{formatKSh(subtotal)}</span>
                                </div>
                                <div className="mb-2.5 flex justify-between text-[13.5px] text-mutedink">
                                    Delivery
                                    <span className={deliveryFee === 0 ? 'text-stock' : 'tnum'}>
                                        {deliveryFee === 0 ? 'Free' : formatKSh(deliveryFee)}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3.5">
                                    <span className="text-[15px] font-bold text-carbon">Total</span>
                                    <span className="font-display text-[22px] font-extrabold text-carbon tnum">
                                        {formatKSh(total)}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={items.length === 0 || phase !== 'idle'}
                                className="font-display mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand text-base font-extrabold text-white shadow-[0_8px_20px_-8px_rgba(228,83,31,0.65)] transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                            >
                                <Lock size={16} /> {pay === 'cod' ? `Place order · ${formatKSh(total)}` : `Pay ${formatKSh(total)}`}
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

            {phase !== 'idle' && <PaymentModal method={pay} phone={payPhone} total={total} done={phase === 'done'} />}
        </div>
    )
}

function PaymentModal({ method, phone, total, done }: { method: PayId; phone: string; total: number; done: boolean }) {
    const Icon = method === 'mpesa' ? Smartphone : method === 'card' ? CreditCard : Truck
    const title = done
        ? method === 'cod' ? 'Order placed!' : 'Payment confirmed'
        : method === 'mpesa' ? 'Check your phone' : method === 'card' ? 'Authorising your card' : 'Placing your order'
    const text = done
        ? 'Taking you to your order…'
        : method === 'mpesa'
            ? `We've sent an M-Pesa prompt to ${phone} for ${formatKSh(total)}. (Simulated — no action needed.)`
            : method === 'card'
                ? `Processing ${formatKSh(total)} securely. (Simulated — no charge is made.)`
                : 'Confirming stock and reserving your parts.'

    return (
        <div role="dialog" aria-modal="true" aria-live="polite"
            className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl animate-in zoom-in-95">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${done ? 'bg-stock-wash text-stock' : 'bg-brand-wash text-brand'}`}>
                    {done ? <CheckCircle2 size={30} /> : <Icon size={28} />}
                </div>
                <h2 className="mt-5 font-display text-xl font-extrabold text-carbon">{title}</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-mutedink">{text}</p>
                {!done && <Loader2 size={22} className="mx-auto mt-6 animate-spin text-brand" />}
            </div>
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
