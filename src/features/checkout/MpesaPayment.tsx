'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Clock, Loader2, Smartphone, XCircle } from 'lucide-react'
import { orderApi, type PaymentStatus, type PaymentView } from '@/lib/api'
import { getToken } from '@/features/auth/token'
import { formatKSh } from '@/libs/utils'

const POLL_MS = 3000

const fieldCls =
    'h-[44px] w-full rounded-lg border border-line-strong bg-white px-3.5 text-sm text-carbon outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10'

interface Props {
    orderId: string
    /** the prompt sent at checkout — shown until the first status poll lands */
    initial?: PaymentView | null
    defaultPhone?: string
    onPaid?: () => void
}

/**
 * Live M-Pesa payment state for an order: waits for the shopper to enter
 * their PIN (polling the backend, which also reconciles with Safaricom), and
 * lets them re-send the prompt — to another phone if needed — until the
 * order's payment deadline.
 */
export default function MpesaPayment({ orderId, initial, defaultPhone, onPaid }: Props) {
    const [status, setStatus] = useState<PaymentStatus | null>(null)
    const [phone, setPhone] = useState(defaultPhone ?? '')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pollKey, setPollKey] = useState(0)
    const announced = useRef(false)

    useEffect(() => {
        const token = getToken()
        if (!token) return
        let live = true
        let timer: ReturnType<typeof setTimeout> | undefined
        const poll = async () => {
            try {
                const s = await orderApi.paymentStatus(token, orderId)
                if (!live) return
                setStatus(s)
                const settled = s.paymentStatus === 'PAID' || s.status !== 'PENDING' || s.payment?.status !== 'PENDING'
                if (!settled) timer = setTimeout(poll, POLL_MS)
            } catch {
                if (live) timer = setTimeout(poll, POLL_MS * 2)
            }
        }
        void poll()
        return () => {
            live = false
            clearTimeout(timer)
        }
    }, [orderId, pollKey])

    const paid = status?.paymentStatus === 'PAID'
    useEffect(() => {
        if (paid && !announced.current) {
            announced.current = true
            onPaid?.()
        }
    }, [paid, onPaid])

    const resend = async () => {
        const token = getToken()
        if (!token) return
        setBusy(true)
        setError(null)
        try {
            await orderApi.pay(token, orderId, phone.trim() || undefined)
            setPollKey((k) => k + 1)
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'We couldn’t resend the prompt. Please try again.')
        } finally {
            setBusy(false)
        }
    }

    const payment = status?.payment ?? initial ?? null
    const amount = status?.total ?? payment?.amount ?? 0
    const closed = !!status && status.status !== 'PENDING' && !paid
    const waiting = !paid && !closed && payment?.status === 'PENDING'
    const due = status?.paymentDueAt ? new Date(status.paymentDueAt) : null

    if (paid) {
        const receipt = payment?.status === 'SUCCESS' ? payment.receiptNumber : null
        return (
            <State icon={<CheckCircle2 size={30} />} tone="ok" title="Payment received">
                {formatKSh(amount)} paid via M-Pesa{receipt ? <> · receipt <span className="font-mono font-semibold text-carbon">{receipt}</span></> : null}.
            </State>
        )
    }

    if (closed) {
        return (
            <State icon={<XCircle size={30} />} tone="muted" title="This order is closed">
                {status?.status === 'CANCELLED'
                    ? 'It was cancelled before payment was received, and the parts have been released. You can place a new order any time.'
                    : 'This order can no longer be paid.'}
            </State>
        )
    }

    return (
        <div>
            {waiting ? (
                <State icon={<Smartphone size={28} />} tone="brand" title="Check your phone">
                    Enter your M-Pesa PIN to pay <span className="font-semibold text-carbon">{formatKSh(amount)}</span> to Genesis.
                    {payment?.phone && <> We sent the prompt to <span className="font-mono">{payment.phone}</span>.</>}
                    <span className="mt-4 flex items-center justify-center gap-2 text-[12.5px] text-faint">
                        <Loader2 size={15} className="animate-spin text-brand" /> Waiting for M-Pesa to confirm…
                    </span>
                </State>
            ) : (
                <State icon={<XCircle size={28} />} tone="warn" title="Payment not completed">
                    {sentence(payment?.message) || 'We haven’t received your M-Pesa payment yet.'} Send the prompt again to finish paying.
                </State>
            )}

            {(!waiting || status?.canRetry) && (
                <div className="mt-5 rounded-xl border border-line bg-surface p-4 text-left">
                    <label className="mb-1.5 block text-[12.5px] font-semibold text-mutedink" htmlFor={`mp-${orderId}`}>
                        {waiting ? 'Didn’t get the prompt? Send it again to' : 'M-Pesa phone number'}
                    </label>
                    <div className="flex gap-2">
                        <input id={`mp-${orderId}`} type="tel" className={fieldCls} value={phone} onChange={(e) => setPhone(e.target.value)}
                            placeholder="0712 345 678" autoComplete="tel" />
                        <button type="button" onClick={resend} disabled={busy}
                            className="inline-flex h-[44px] shrink-0 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-60">
                            {busy && <Loader2 size={15} className="animate-spin" />} Send prompt
                        </button>
                    </div>
                    {error && <p className="mt-2 text-[12.5px] font-medium text-[#b23b32]">{error}</p>}
                </div>
            )}

            {due && (
                <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-faint">
                    <Clock size={13} /> Your parts are reserved until {due.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })} — pay before then to keep the order.
                </p>
            )}
        </div>
    )
}

/** Daraja's result texts ("Request cancelled by user") have no full stop. */
const sentence = (t?: string | null) => (t ? (/[.!?]$/.test(t.trim()) ? t.trim() : `${t.trim()}.`) : '')

function State({ icon, tone, title, children }: { icon: React.ReactNode; tone: 'ok' | 'brand' | 'warn' | 'muted'; title: string; children: React.ReactNode }) {
    const toneCls = {
        ok: 'bg-stock-wash text-stock',
        brand: 'bg-brand-wash text-brand',
        warn: 'bg-[#fdecea] text-[#b23b32]',
        muted: 'bg-surface text-mutedink',
    }[tone]
    return (
        <div className="text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${toneCls}`}>{icon}</div>
            <h2 className="mt-5 font-display text-xl font-extrabold text-carbon">{title}</h2>
            <div className="mt-2 text-[13.5px] leading-relaxed text-mutedink">{children}</div>
        </div>
    )
}
