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
import AddressFields, { emptyAddress, type AddressValue } from '@/features/location/AddressFields'
import { useSavedAddresses } from '@/features/location/useSavedAddresses'
import { addressesApi, type SavedAddress } from '@/lib/api'
import { mapsLink } from '@/lib/maps'

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
    const [form, setForm] = useState({ fullName: '', phone: '' })
    const [addr, setAddr] = useState<AddressValue>(emptyAddress)
    // which saved address is being delivered to, or 'new' for one typed / pinned here
    const [savedId, setSavedId] = useState<string | null>(null)
    const [saveNew, setSaveNew] = useState(true)
    const [saveLabel, setSaveLabel] = useState('')
    const { addresses } = useSavedAddresses()
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [phase, setPhase] = useState<Phase>('idle')
    const [error, setError] = useState<string | null>(null)
    const [placed, setPlaced] = useState<{ id: string; payment: PaymentView | null } | null>(null)

    const zones = useDeliveryZones()
    const towns = useMemo(() => townNames(zones?.zones ?? []), [zones])
    const lines = useMemo(() => items.map((i) => ({ productId: i.id, quantity: i.qty })), [items])
    const { quote, loading: quoting, error: quoteError } = useQuote(lines, addr.city)

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

    // Start from the default saved address, else a new one in the town priced on the cart page.
    // Done while rendering (not in an effect) the first time the addresses arrive.
    if (addresses !== null && savedId === null) {
        if (addresses.length) {
            chooseSaved(addresses[0])
        } else {
            setSavedId('new')
            const town = rememberedTown()
            if (town && !addr.city) setAddr({ ...addr, city: town })
        }
    }

    function chooseSaved(a: SavedAddress) {
        setSavedId(a.id)
        setAddr({
            line1: a.line1,
            landmark: a.line2 ?? '',
            city: a.city,
            pin: a.latitude != null && a.longitude != null ? { lat: a.latitude, lng: a.longitude } : null,
        })
        if (a.phone) setForm((f) => ({ ...f, phone: f.phone || a.phone || '' }))
    }

    const startNew = (from?: AddressValue) => {
        setSavedId('new')
        setAddr(from ?? { ...emptyAddress, city: addr.city })
        const used = new Set((addresses ?? []).map((a) => a.label.toLowerCase()))
        setSaveLabel(['Home', 'Work'].find((l) => !used.has(l.toLowerCase())) ?? `Address ${(addresses?.length ?? 0) + 1}`)
    }
    const isNew = savedId === 'new'

    // pay on delivery only where the delivery zone allows it
    const codAllowed = !!quote?.zone.allowsCod
    useEffect(() => {
        if (quote && !quote.zone.allowsCod && pay === 'cod') setPay('mpesa')
    }, [quote, pay])

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }))

    // remember a new address for next time — never block the order on it
    const saveAddress = async (token: string) => {
        if (!isNew || !saveNew || !saveLabel.trim()) return
        await addressesApi.create(token, {
            label: saveLabel.trim(),
            line1: addr.line1.trim(),
            line2: addr.landmark.trim() || undefined,
            city: addr.city.trim(),
            phone: form.phone.trim() || undefined,
            ...(addr.pin ? { latitude: addr.pin.lat, longitude: addr.pin.lng } : {}),
        }).catch(() => undefined)
    }

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
                address: addr.line1,
                city: addr.city,
                landmark: addr.landmark || undefined,
                ...(addr.pin ? { latitude: addr.pin.lat, longitude: addr.pin.lng } : {}),
                paymentMethod: pay,
            })
            rememberTown(addr.city)
            await saveAddress(token)
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

                            {!!addresses?.length && (
                                <div className="mb-5">
                                    <div className={labelCls}>Deliver to</div>
                                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                        {addresses.map((a) => (
                                            <button key={a.id} type="button" onClick={() => chooseSaved(a)} aria-pressed={savedId === a.id}
                                                className={`rounded-xl border px-4 py-3 text-left transition ${savedId === a.id ? 'border-[1.5px] border-brand bg-brand-wash' : 'border-line-strong hover:border-[#c9cdd6]'}`}>
                                                <span className="flex items-center gap-2 text-[13.5px] font-semibold text-carbon">
                                                    {a.label}
                                                    {a.isDefault && <span className="rounded bg-white px-1.5 py-0.5 text-[10.5px] font-semibold text-faint">Default</span>}
                                                    {a.latitude != null && <MapPin size={13} className="text-stock" aria-label="Pinned on map" />}
                                                </span>
                                                <span className="mt-0.5 block truncate text-[12.5px] text-mutedink">{a.line1}{a.line2 ? `, near ${a.line2}` : ''}</span>
                                                <span className="block text-[12.5px] text-faint">{a.city}</span>
                                            </button>
                                        ))}
                                        <button type="button" onClick={() => startNew()} aria-pressed={isNew}
                                            className={`rounded-xl border border-dashed px-4 py-3 text-left text-[13.5px] font-semibold transition ${isNew ? 'border-[1.5px] border-solid border-brand bg-brand-wash text-carbon' : 'border-line-strong text-mutedink hover:text-carbon'}`}>
                                            + New address
                                            <span className="mt-0.5 block text-[12.5px] font-normal text-faint">Use your location, pin it on the map or type it</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isNew ? (
                                <>
                                    <AddressFields value={addr} onChange={setAddr} towns={towns} idPrefix="co" />
                                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-surface px-4 py-3">
                                        <label className="flex items-center gap-2 text-[13px] font-medium text-carbon">
                                            <input type="checkbox" checked={saveNew} onChange={(e) => setSaveNew(e.target.checked)} className="h-4 w-4 accent-brand" />
                                            Save this address as
                                        </label>
                                        <input aria-label="Address name" value={saveLabel} onChange={(e) => setSaveLabel(e.target.value)} disabled={!saveNew} maxLength={40}
                                            placeholder="Home" className="h-9 w-40 rounded-lg border border-line-strong bg-white px-3 text-[13px] outline-none focus:border-brand disabled:opacity-50" />
                                    </div>
                                </>
                            ) : savedId && (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px]">
                                    {addr.pin && (
                                        <a href={mapsLink(addr.pin)} target="_blank" rel="noreferrer" className="font-medium text-stock underline underline-offset-2">Pinned location</a>
                                    )}
                                    <button type="button" onClick={() => startNew({ ...addr })} className="font-semibold text-brand-ink underline underline-offset-2">
                                        Change this address for this order
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* delivery — priced from the town */}
                        <section className="mb-4 rounded-2xl border border-hairline bg-white p-6">
                            <div className="font-display mb-4 text-lg font-extrabold text-carbon">Delivery</div>
                            {addr.city.trim().length < 2 ? (
                                <p className="flex items-center gap-2 text-[13px] text-faint"><MapPin size={15} /> Enter your town above to see delivery options and fees.</p>
                            ) : quoteError ? (
                                <p className="text-[13px] font-medium text-[#b23b32]">{quoteError}</p>
                            ) : !quote ? (
                                <p className="flex items-center gap-2 text-[13px] text-faint"><Loader2 size={15} className="animate-spin" /> Checking delivery to {addr.city.trim()}…</p>
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
                                    Add <span className="font-semibold text-carbon">{formatKSh(quote.amountToFreeDelivery)}</span> more for free delivery to {addr.city.trim()}.
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
