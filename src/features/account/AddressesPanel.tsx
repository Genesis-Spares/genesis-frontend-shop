'use client'

import { useMemo, useState } from "react";
import { Loader2, MapPin, Pencil, Phone, Plus, Star, Trash2 } from "lucide-react";
import { addressesApi, townNames, type SavedAddress } from "@/lib/api";
import { mapsLink } from "@/lib/maps";
import { getToken } from "@/features/auth/token";
import { AuthError } from "@/features/auth/AuthFields";
import AddressFields, { emptyAddress, fieldCls, labelCls, type AddressValue } from "@/features/location/AddressFields";
import { useSavedAddresses } from "@/features/location/useSavedAddresses";
import { useDeliveryZones } from "@/features/checkout/useQuote";
import { PanelHeader, cardCls } from "./AccountShell";

export default function AddressesPanel() {
    const { addresses, reload } = useSavedAddresses();
    const zones = useDeliveryZones();
    const towns = useMemo(() => townNames(zones?.zones ?? []), [zones]);
    const [editing, setEditing] = useState<SavedAddress | "new" | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const act = async (id: string, fn: (token: string) => Promise<unknown>) => {
        const token = getToken();
        if (!token) return;
        setBusyId(id);
        setError(null);
        try {
            await fn(token);
            reload();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
        } finally {
            setBusyId(null);
            setConfirmDelete(null);
        }
    };

    return (
        <div>
            <PanelHeader
                title="Addresses"
                subtitle="Saved delivery addresses for faster checkout. Pin them on the map so our riders find you first time."
                action={editing === null && (
                    <button onClick={() => setEditing("new")}
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover">
                        <Plus size={16} /> Add address
                    </button>
                )}
            />

            {error && <AuthError>{error}</AuthError>}

            {editing !== null && (
                <AddressEditor
                    key={editing === "new" ? "new" : editing.id}
                    address={editing === "new" ? null : editing}
                    isFirst={!addresses?.length}
                    towns={towns}
                    onCancel={() => setEditing(null)}
                    onSaved={() => { setEditing(null); reload(); }}
                />
            )}

            {addresses === null ? (
                <div className={`${cardCls} flex justify-center py-16 text-faint`}><Loader2 size={22} className="animate-spin" /></div>
            ) : addresses.length === 0 && editing === null ? (
                <div className={`${cardCls} px-6 py-14 text-center`}>
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-faint"><MapPin size={24} /></span>
                    <p className="mt-4 font-semibold text-carbon">No saved addresses yet</p>
                    <p className="mt-1 text-[13.5px] text-mutedink">Add one here, or tick &ldquo;Save this address&rdquo; at checkout.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {addresses.map((a) => (
                        <div key={a.id} className={`${cardCls} flex flex-col p-5`}>
                            <div className="flex items-center gap-2">
                                <h3 className="font-display text-[16px] font-bold text-carbon">{a.label}</h3>
                                {a.isDefault && <span className="rounded-full bg-brand-wash px-2 py-0.5 text-[11px] font-semibold text-brand-ink">Default</span>}
                            </div>
                            <div className="mt-2 flex-1 text-[13.5px] leading-relaxed text-mutedink">
                                <p className="text-carbon">{a.line1}</p>
                                {a.line2 && <p>Near {a.line2}</p>}
                                <p>{a.city}{a.country ? `, ${a.country}` : ""}</p>
                                {a.phone && <p className="mt-1 inline-flex items-center gap-1.5"><Phone size={13} /> {a.phone}</p>}
                                {a.deliveryInstructions && <p className="mt-1 italic">&ldquo;{a.deliveryInstructions}&rdquo;</p>}
                                {a.latitude != null && a.longitude != null ? (
                                    <a href={mapsLink({ lat: a.latitude, lng: a.longitude })} target="_blank" rel="noreferrer"
                                        className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-stock underline underline-offset-2">
                                        <MapPin size={13} /> Pinned on map
                                    </a>
                                ) : (
                                    <p className="mt-2 text-[12.5px] text-faint">Not pinned — edit to add the exact spot.</p>
                                )}
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                                <button onClick={() => setEditing(a)} disabled={editing !== null}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong px-3 text-[12.5px] font-semibold text-carbon hover:border-brand hover:text-brand disabled:opacity-40">
                                    <Pencil size={13} /> Edit
                                </button>
                                {!a.isDefault && (
                                    <button onClick={() => act(a.id, (t) => addressesApi.update(t, a.id, { isDefault: true }))} disabled={busyId === a.id}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong px-3 text-[12.5px] font-semibold text-carbon hover:border-brand hover:text-brand disabled:opacity-40">
                                        <Star size={13} /> Set as default
                                    </button>
                                )}
                                <button
                                    onClick={() => confirmDelete === a.id ? act(a.id, (t) => addressesApi.remove(t, a.id)) : setConfirmDelete(a.id)}
                                    disabled={busyId === a.id}
                                    className={`ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold disabled:opacity-40 ${confirmDelete === a.id ? "bg-[#b23b32] text-white" : "text-faint hover:text-[#b23b32]"}`}>
                                    {busyId === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                    {confirmDelete === a.id ? "Confirm delete" : "Delete"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AddressEditor({ address, isFirst, towns, onCancel, onSaved }: {
    address: SavedAddress | null; isFirst: boolean; towns: string[]; onCancel: () => void; onSaved: () => void;
}) {
    const [label, setLabel] = useState(address?.label ?? (isFirst ? "Home" : ""));
    const [value, setValue] = useState<AddressValue>(address ? {
        line1: address.line1,
        landmark: address.line2 ?? "",
        city: address.city,
        pin: address.latitude != null && address.longitude != null ? { lat: address.latitude, lng: address.longitude } : null,
    } : emptyAddress);
    const [phone, setPhone] = useState(address?.phone ?? "");
    const [instructions, setInstructions] = useState(address?.deliveryInstructions ?? "");
    const [isDefault, setIsDefault] = useState(address?.isDefault ?? isFirst);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;
        setBusy(true);
        setError(null);
        const body = {
            label: label.trim(),
            line1: value.line1.trim(),
            line2: value.landmark.trim() || undefined,
            city: value.city.trim(),
            phone: phone.trim() || undefined,
            deliveryInstructions: instructions.trim() || undefined,
            isDefault,
            ...(value.pin ? { latitude: value.pin.lat, longitude: value.pin.lng } : {}),
        };
        try {
            if (address) await addressesApi.update(token, address.id, body);
            else await addressesApi.create(token, body);
            onSaved();
        } catch (err) {
            setError(err instanceof Error ? err.message : "We couldn't save this address.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={save} className={`${cardCls} mb-6 p-6`}>
            <h3 className="mb-5 font-display text-[17px] font-bold text-carbon">{address ? `Edit ${address.label}` : "New address"}</h3>
            {error && <AuthError>{error}</AuthError>}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelCls} htmlFor="ad-label">Name this address</label>
                    <input id="ad-label" required maxLength={40} className={fieldCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home, Work, Garage…" />
                </div>
                <div>
                    <label className={labelCls} htmlFor="ad-phone">Phone at this address <span className="font-normal text-faint">(optional)</span></label>
                    <input id="ad-phone" type="tel" className={fieldCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" />
                </div>
            </div>
            <AddressFields value={value} onChange={setValue} towns={towns} idPrefix="ad" />
            <div className="mt-4">
                <label className={labelCls} htmlFor="ad-notes">Directions for the rider <span className="font-normal text-faint">(optional)</span></label>
                <textarea id="ad-notes" rows={2} maxLength={300} value={instructions} onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Blue gate opposite the church, call on arrival"
                    className="w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-sm text-carbon outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10" />
            </div>
            <label className="mt-3 flex items-center gap-2 text-[13px] font-medium text-carbon">
                <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="h-4 w-4" />
                Use as my default delivery address
            </label>
            <div className="mt-5 flex gap-2">
                <button type="submit" disabled={busy}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
                    {busy && <Loader2 size={15} className="animate-spin" />} Save address
                </button>
                <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-line-strong px-5 text-sm font-semibold text-mutedink hover:text-carbon">Cancel</button>
            </div>
        </form>
    );
}
