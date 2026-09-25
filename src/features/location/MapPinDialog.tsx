'use client'

import { useEffect, useRef, useState } from 'react'
import { Crosshair, Loader2, MapPin, X } from 'lucide-react'
import { DEFAULT_CENTER, MAP_ID, currentPosition, loadMaps, reverseGeocode, type LatLng, type PickedPlace } from '@/lib/maps'

interface Props {
    start: LatLng | null
    onClose: () => void
    onPick: (place: PickedPlace) => void
}

const toLiteral = (p: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined): LatLng | null =>
    !p ? null : typeof p.lat === 'function' ? { lat: (p as google.maps.LatLng).lat(), lng: (p as google.maps.LatLng).lng() } : (p as LatLng)

/** Full-screen-ish map: drag the pin (or tap the map) to the exact drop-off spot. */
export default function MapPinDialog({ start, onClose, onPick }: Props) {
    const el = useRef<HTMLDivElement>(null)
    const map = useRef<google.maps.Map | null>(null)
    const marker = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
    const [pos, setPos] = useState<LatLng>(start ?? DEFAULT_CENTER)
    const [preview, setPreview] = useState<PickedPlace | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [ready, setReady] = useState(false)
    const [locating, setLocating] = useState(false)

    useEffect(() => {
        let live = true
        ;(async () => {
            try {
                await loadMaps()
                const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary
                const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary
                if (!live || !el.current) return
                const center = start ?? DEFAULT_CENTER
                map.current = new Map(el.current, {
                    center, zoom: start ? 17 : 12, mapId: MAP_ID,
                    disableDefaultUI: true, zoomControl: true, clickableIcons: false, gestureHandling: 'greedy',
                })
                marker.current = new AdvancedMarkerElement({ map: map.current, position: center, gmpDraggable: true, title: 'Delivery spot' })
                marker.current.addListener('dragend', () => {
                    const p = toLiteral(marker.current?.position as google.maps.LatLngLiteral)
                    if (p) setPos(p)
                })
                map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
                    const p = toLiteral(e.latLng)
                    if (!p || !marker.current) return
                    marker.current.position = p
                    setPos(p)
                })
                setReady(true)
            } catch (e) {
                if (live) setError(e instanceof Error ? e.message : "Couldn't load the map.")
            }
        })()
        return () => { live = false }
    }, [start])

    // what's at the pin, shown under the map
    useEffect(() => {
        if (!ready) return
        let live = true
        const t = setTimeout(() => {
            reverseGeocode(pos).then((p) => live && setPreview(p)).catch(() => live && setPreview(null))
        }, 350)
        return () => { live = false; clearTimeout(t) }
    }, [pos, ready])

    const locate = async () => {
        setLocating(true)
        setError(null)
        try {
            const p = await currentPosition()
            const at = { lat: p.lat, lng: p.lng }
            if (marker.current) marker.current.position = at
            map.current?.panTo(at)
            map.current?.setZoom(17)
            setPos(at)
        } catch (e) {
            setError(e instanceof Error ? e.message : "We couldn't find your location.")
        } finally {
            setLocating(false)
        }
    }

    const confirm = () => onPick(preview && preview.lat === pos.lat && preview.lng === pos.lng ? preview : { ...pos, line1: preview?.line1 ?? '', city: preview?.city ?? '', formatted: preview?.formatted ?? '' })

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    return (
        <div role="dialog" aria-modal="true" aria-label="Pin your delivery spot"
            className="fixed inset-0 z-50 flex items-end justify-center bg-carbon/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
            <div className="w-full max-w-2xl overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl" onMouseDown={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                    <div>
                        <h2 className="font-display text-[17px] font-extrabold text-carbon">Pin your delivery spot</h2>
                        <p className="text-[12.5px] text-faint">Drag the pin or tap the map where the rider should come.</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-faint hover:bg-surface hover:text-carbon"><X size={18} /></button>
                </div>
                <div className="relative h-[55vh] max-h-[420px] min-h-[280px] bg-surface">
                    <div ref={el} className="absolute inset-0" data-testid="pin-map" />
                    {!ready && !error && <div className="absolute inset-0 flex items-center justify-center text-faint"><Loader2 size={22} className="animate-spin" /></div>}
                    {ready && (
                        <button type="button" onClick={locate} disabled={locating}
                            className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[12.5px] font-semibold text-carbon shadow-md hover:text-brand disabled:opacity-60">
                            {locating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />} My location
                        </button>
                    )}
                </div>
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                    <p className="flex min-w-0 flex-1 items-start gap-2 text-[13px] text-mutedink">
                        <MapPin size={15} className="mt-0.5 shrink-0 text-brand" />
                        <span className="min-w-0">{error ?? (preview?.formatted || `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`)}</span>
                    </p>
                    <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={onClose} className="h-10 rounded-lg border border-line-strong px-4 text-sm font-semibold text-mutedink hover:text-carbon">Cancel</button>
                        <button type="button" onClick={confirm} disabled={!ready}
                            className="h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50">Use this location</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
