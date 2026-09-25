'use client'

import { useState } from 'react'
import { CheckCircle2, Crosshair, Loader2, MapPin } from 'lucide-react'
import { currentPosition, mapsEnabled, mapsLink, reverseGeocode, type LatLng, type PickedPlace } from '@/lib/maps'
import AddressSearchInput from './AddressSearchInput'
import MapPinDialog from './MapPinDialog'

export const fieldCls =
    'h-[46px] w-full rounded-lg border border-line-strong bg-white px-3.5 text-sm text-carbon outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10'
export const labelCls = 'mb-1.5 block text-[12.5px] font-semibold text-mutedink'

export interface AddressValue {
    line1: string
    landmark: string
    city: string
    pin: LatLng | null
}

export const emptyAddress: AddressValue = { line1: '', landmark: '', city: '', pin: null }

interface Props {
    value: AddressValue
    onChange: (next: AddressValue) => void
    towns: string[]
    idPrefix?: string
}

/**
 * Street address, landmark and town, filled by typing (with suggestions),
 * from the device's location, or by pinning the spot on a map. The pin
 * travels with the order so the rider can navigate to it.
 */
export default function AddressFields({ value, onChange, towns, idPrefix = 'addr' }: Props) {
    const [locating, setLocating] = useState(false)
    const [mapOpen, setMapOpen] = useState(false)
    const [note, setNote] = useState<{ tone: 'info' | 'error'; text: string } | null>(null)

    const set = (patch: Partial<AddressValue>) => onChange({ ...value, ...patch })

    /** A found place fills whatever it knows; the shopper's own typing is kept otherwise. */
    const apply = (p: PickedPlace) =>
        onChange({ ...value, line1: p.line1 || value.line1, city: p.city || value.city, pin: { lat: p.lat, lng: p.lng } })

    const useMyLocation = async () => {
        setLocating(true)
        setNote(null)
        try {
            const pos = await currentPosition()
            const at = { lat: pos.lat, lng: pos.lng }
            if (mapsEnabled) {
                apply(await reverseGeocode(at).catch(() => ({ ...at, line1: '', city: '', formatted: '' })))
            } else {
                set({ pin: at })
            }
            if (pos.accuracy > 150) {
                setNote({ tone: 'info', text: `Your location is accurate to about ${Math.round(pos.accuracy)} m${mapsEnabled ? ' — check the pin on the map' : ''}.` })
            }
        } catch (e) {
            setNote({ tone: 'error', text: e instanceof Error ? e.message : "We couldn't get your location." })
        } finally {
            setLocating(false)
        }
    }

    const listId = `${idPrefix}-towns`
    return (
        <div>
            <div className="mb-4">
                <label className={labelCls} htmlFor={`${idPrefix}-line1`}>Delivery address</label>
                <AddressSearchInput id={`${idPrefix}-line1`} required autoComplete="street-address" className={fieldCls}
                    value={value.line1} onChange={(line1) => set({ line1 })} onPick={apply} near={value.pin}
                    placeholder={mapsEnabled ? 'Start typing — estate, street, building…' : 'Estate, street, building / house no.'} />
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={useMyLocation} disabled={locating}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong bg-white px-3 text-[12.5px] font-semibold text-carbon transition hover:border-brand hover:text-brand disabled:opacity-60">
                    {locating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />} Use my current location
                </button>
                {mapsEnabled && (
                    <button type="button" onClick={() => setMapOpen(true)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong bg-white px-3 text-[12.5px] font-semibold text-carbon transition hover:border-brand hover:text-brand">
                        <MapPin size={14} /> {value.pin ? 'Adjust pin on map' : 'Pin on map'}
                    </button>
                )}
                {value.pin && (
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-stock">
                        <CheckCircle2 size={14} /> Delivery pin set ·
                        <a href={mapsLink(value.pin)} target="_blank" rel="noreferrer" className="underline underline-offset-2">view</a>
                        <button type="button" onClick={() => set({ pin: null })} className="text-faint underline underline-offset-2 hover:text-carbon">remove</button>
                    </span>
                )}
            </div>
            {note && <p className={`mb-3 text-[12.5px] ${note.tone === 'error' ? 'font-medium text-[#b23b32]' : 'text-mutedink'}`}>{note.text}</p>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelCls} htmlFor={`${idPrefix}-city`}>City / Town</label>
                    <input id={`${idPrefix}-city`} required autoComplete="address-level2" list={listId} className={fieldCls}
                        value={value.city} onChange={(e) => set({ city: e.target.value })} placeholder="e.g. Nairobi, Nakuru, Mombasa" />
                    <datalist id={listId}>{towns.map((t) => <option key={t} value={t} />)}</datalist>
                </div>
                <div>
                    <label className={labelCls} htmlFor={`${idPrefix}-landmark`}>Nearest landmark <span className="font-normal text-faint">(optional)</span></label>
                    <input id={`${idPrefix}-landmark`} className={fieldCls} value={value.landmark}
                        onChange={(e) => set({ landmark: e.target.value })} placeholder="e.g. Yaya Centre" />
                </div>
            </div>

            {mapOpen && (
                <MapPinDialog start={value.pin} onClose={() => setMapOpen(false)}
                    onPick={(p) => { apply(p); setMapOpen(false) }} />
            )}
        </div>
    )
}
