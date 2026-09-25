'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { mapsEnabled, newSessionToken, placeDetails, suggestPlaces, type LatLng, type PickedPlace, type Suggestion } from '@/lib/maps'

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: string
    onChange: (value: string) => void
    /** a suggestion was chosen — full address and coordinates */
    onPick: (place: PickedPlace) => void
    near?: LatLng | null
}

/** Address input that suggests Kenyan places as you type (Google Places). A plain input without a Maps key. */
export default function AddressSearchInput({ value, onChange, onPick, near, className, ...rest }: Props) {
    const [items, setItems] = useState<Suggestion[]>([])
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)
    const [busy, setBusy] = useState(false)
    const token = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
    const typed = useRef(false)

    useEffect(() => {
        const q = value.trim()
        if (!mapsEnabled || !typed.current || q.length < 3) return
        let live = true
        const t = setTimeout(async () => {
            try {
                token.current ??= await newSessionToken()
                const found = await suggestPlaces(q, token.current, near)
                if (!live) return
                setItems(found)
                setActive(-1)
                setOpen(found.length > 0)
            } catch {
                if (live) setOpen(false)
            }
        }, 250)
        return () => {
            live = false
            clearTimeout(t)
        }
    }, [value, near])

    const choose = async (s: Suggestion) => {
        setOpen(false)
        setBusy(true)
        try {
            const place = await placeDetails(s)
            typed.current = false
            onPick(place)
        } catch {
            onChange(s.main)
        } finally {
            token.current = null
            setBusy(false)
        }
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || !items.length) return
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % items.length) }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i <= 0 ? items.length - 1 : i - 1)) }
        else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); void choose(items[active]) }
        else if (e.key === 'Escape') setOpen(false)
    }

    const listId = `${rest.id ?? 'address'}-suggestions`
    return (
        <div className="relative">
            <input
                {...rest}
                value={value}
                onChange={(e) => { typed.current = true; onChange(e.target.value); if (!e.target.value.trim()) setOpen(false) }}
                onKeyDown={onKeyDown}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                onFocus={() => items.length && typed.current && setOpen(true)}
                className={className}
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                autoComplete="off"
            />
            {busy && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-faint" />}
            {open && (
                <ul id={listId} role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg">
                    {items.map((s, i) => (
                        <li key={s.id} role="option" aria-selected={i === active}
                            onMouseDown={(e) => { e.preventDefault(); void choose(s) }}
                            onMouseEnter={() => setActive(i)}
                            className={`flex cursor-pointer items-start gap-2.5 px-3.5 py-2.5 text-left ${i === active ? 'bg-brand-wash' : ''}`}>
                            <MapPin size={15} className="mt-0.5 shrink-0 text-faint" />
                            <span className="min-w-0">
                                <span className="block truncate text-[13.5px] font-medium text-carbon">{s.main}</span>
                                {s.secondary && <span className="block truncate text-[12px] text-faint">{s.secondary}</span>}
                            </span>
                        </li>
                    ))}
                    <li className="px-3.5 pb-1 pt-1.5 text-right text-[10.5px] text-faint">Powered by Google</li>
                </ul>
            )}
        </div>
    )
}
