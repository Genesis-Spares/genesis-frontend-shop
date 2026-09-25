'use client'

import { useState } from "react";
import { Loader2, Check, Mail, Phone, BadgeCheck, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { profileApi } from "@/lib/api";
import { getToken } from "@/features/auth/token";
import { AuthError, AuthField } from "@/features/auth/AuthFields";
import { PanelHeader, cardCls } from "./AccountShell";

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 gap-5 px-6 py-7 md:grid-cols-[220px_1fr] md:gap-10">
            <div>
                <h3 className="text-[14.5px] font-semibold text-carbon">{title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-mutedink">{description}</p>
            </div>
            <div className="max-w-xl">{children}</div>
        </div>
    );
}

export default function ProfilePanel() {
    const { user, refreshUser, logout } = useAuth();
    const router = useRouter();
    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName, setLastName] = useState(user?.lastName ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dirty =
        firstName !== (user?.firstName ?? "") || lastName !== (user?.lastName ?? "") || phone !== (user?.phone ?? "");

    const reset = () => {
        setFirstName(user?.firstName ?? "");
        setLastName(user?.lastName ?? "");
        setPhone(user?.phone ?? "");
        setError(null);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;
        setBusy(true); setError(null); setDone(false);
        try {
            await profileApi.update(token, { firstName, lastName, phone });
            await refreshUser();
            setDone(true);
            setTimeout(() => setDone(false), 2500);
        } catch (err: any) {
            setError(err?.message || "Couldn't save your profile.");
        } finally { setBusy(false); }
    };

    return (
        <div className="animate-in fade-in duration-300">
            <PanelHeader title="Profile & settings" subtitle="Manage your personal details and how we contact you." />

            <form onSubmit={save} className={`${cardCls} divide-y divide-line`}>
                <Section title="Personal information" description="Used on your orders, invoices and delivery labels.">
                    {error && <AuthError>{error}</AuthError>}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                        <AuthField id="fn" label="First name" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <AuthField id="ln" label="Last name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                </Section>

                <Section title="Contact" description="We'll send order updates and delivery notifications here.">
                    <div className="space-y-5">
                        <AuthField id="em" label="Email address" icon={Mail} value={user?.email ?? ""} disabled
                            hint={user?.emailVerified
                                ? <span className="inline-flex items-center gap-1 font-semibold text-stock"><BadgeCheck size={13} /> Verified</span>
                                : "Can't be changed"} />
                        <AuthField id="ph" label="Phone number" icon={Phone} type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" />
                    </div>
                </Section>

                <div className="flex flex-wrap items-center justify-end gap-3 rounded-b-2xl bg-surface px-6 py-4">
                    {done && (
                        <span className="mr-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-stock animate-in fade-in">
                            <Check size={15} /> Changes saved
                        </span>
                    )}
                    <button type="button" onClick={reset} disabled={!dirty || busy}
                        className="h-11 rounded-xl border border-line-strong bg-white px-5 text-[13.5px] font-semibold text-carbon transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50">
                        Cancel
                    </button>
                    <button type="submit" disabled={!dirty || busy}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[13.5px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(228,83,31,0.65)] transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none">
                        {busy ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save changes"}
                    </button>
                </div>
            </form>

            <div className={`${cardCls} mt-6 flex flex-wrap items-center justify-between gap-4 px-6 py-5`}>
                <div>
                    <h3 className="text-[14.5px] font-semibold text-carbon">Sign out</h3>
                    <p className="mt-0.5 text-[13px] text-mutedink">End your session on this device.</p>
                </div>
                <button type="button" onClick={() => { logout(); router.replace("/"); }}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#f0cfcb] px-4 text-[13px] font-semibold text-[#b23b32] transition hover:bg-[#fdf3f2]">
                    <LogOut size={15} /> Sign out
                </button>
            </div>
        </div>
    );
}
