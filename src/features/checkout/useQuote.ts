'use client'

import { useEffect, useState } from 'react'
import { checkoutApi, type DeliveryZones, type Quote } from '@/lib/api'

const TOWN_KEY = 'genesis_town'

/** The town the shopper last priced delivery for (cart ↔ checkout). */
export function rememberedTown(): string {
    try {
        return localStorage.getItem(TOWN_KEY) ?? ''
    } catch {
        return ''
    }
}

export function rememberTown(town: string) {
    try {
        localStorage.setItem(TOWN_KEY, town.trim())
    } catch {
        /* ignore */
    }
}

let zonesRequest: Promise<DeliveryZones> | null = null

/** Delivery zones + VAT rate (fetched once per page load). */
export function useDeliveryZones() {
    const [zones, setZones] = useState<DeliveryZones | null>(null)
    useEffect(() => {
        let live = true
        zonesRequest ??= checkoutApi.zones().catch((e: unknown) => {
            zonesRequest = null
            throw e
        })
        zonesRequest.then((z) => live && setZones(z)).catch(() => undefined)
        return () => {
            live = false
        }
    }, [])
    return zones
}

interface QuoteState {
    quote: Quote | null
    loading: boolean
    error: string | null
}

const IDLE: QuoteState = { quote: null, loading: false, error: null }

/**
 * Server-priced subtotal, delivery, VAT and total for `lines` delivered to
 * `town` (debounced). Pass a memoised `lines` array. While a new quote loads,
 * the previous one stays visible.
 */
export function useQuote(lines: { productId: string; quantity: number }[], town: string): QuoteState {
    const place = town.trim()
    const priceable = lines.length > 0 && place.length >= 2
    const key = priceable ? JSON.stringify([place.toLowerCase(), lines]) : ''
    const [result, setResult] = useState<{ key: string; quote: Quote | null; error: string | null } | null>(null)

    useEffect(() => {
        if (!priceable) return
        let live = true
        const t = setTimeout(() => {
            checkoutApi
                .quote(place, lines)
                .then((quote) => live && setResult({ key, quote, error: null }))
                .catch((e: unknown) =>
                    live && setResult({ key, quote: null, error: e instanceof Error ? e.message : "We couldn't price delivery." }),
                )
        }, 400)
        return () => {
            live = false
            clearTimeout(t)
        }
    }, [key, lines, place, priceable])

    if (!priceable) return IDLE
    const fresh = result?.key === key
    return { quote: result?.quote ?? null, loading: !fresh, error: fresh ? result.error : null }
}
