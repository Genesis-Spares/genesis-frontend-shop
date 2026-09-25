'use client'

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Phone,
    MessageCircle,
    Mail,
    MapPin,
    Clock,
    Send,
    CheckCircle2,
    Building2,
    Loader2,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getToken } from "@/features/auth/token";
import { AuthError } from "@/features/auth/AuthFields";
import { CONTACT_TOPICS, contactApi, type ContactBody } from "@/lib/api";
import Topbar from "@/components/common/Topbar";
import MainHeader from "@/components/common/MainHeader";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import PageHero from "@/components/common/PageHero";

const fieldCls =
    "h-[46px] w-full rounded-lg border border-line-strong bg-white px-3.5 text-sm text-carbon outline-none focus:border-brand";
const labelCls = "mb-1.5 block text-[12.5px] font-semibold text-mutedink";

const infos = [
    { icon: Phone, label: "Call us", lines: ["0720 123 456", "0711 987 654"] },
    { icon: MessageCircle, label: "WhatsApp", lines: ["0720 123 456", "Mon–Sat, 8am–6pm"] },
    { icon: Mail, label: "Email", lines: ["info@genesisinvestment.co.ke", "trade@genesisinvestment.co.ke"] },
    { icon: MapPin, label: "Visit", lines: ["Enterprise Road", "Industrial Area, Nairobi"] },
];

const hours: [string, string][] = [
    ["Monday – Friday", "8:00am – 6:00pm"],
    ["Saturday", "8:30am – 4:00pm"],
    ["Sunday & holidays", "Closed"],
];

export default function ContactPage() {
    const { user } = useAuth();
    const params = useSearchParams();
    const initialTopic = CONTACT_TOPICS.find((t) => t === params.get("topic")) ?? "Parts enquiry";
    const [form, setForm] = useState<ContactBody>({
        name: user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        topic: initialTopic,
        message: "",
        orderNumber: params.get("order") ?? "",
        website: "",
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState<string | null>(null); // reference number once sent

    // fill in details once the signed-in profile loads (only fields still empty)
    const [filledFor, setFilledFor] = useState<string | null>(null);
    if (user && filledFor !== user.email) {
        setFilledFor(user.email);
        setForm((f) => ({
            ...f,
            name: f.name || [user.firstName, user.lastName].filter(Boolean).join(" "),
            email: f.email || user.email,
            phone: f.phone || user.phone || "",
        }));
    }

    const set = (k: keyof ContactBody) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));
    const needsOrder = form.topic === "Order / delivery" || form.topic === "Returns & warranty";

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            const res = await contactApi.send(
                { ...form, phone: form.phone || undefined, orderNumber: needsOrder && form.orderNumber ? form.orderNumber : undefined },
                getToken(),
            );
            setSent(res.reference);
            setForm((f) => ({ ...f, message: "", orderNumber: "" }));
        } catch (err) {
            setError((err instanceof Error && err.message) || "We couldn't send your message. Please try again or call us.");
        } finally {
            setBusy(false);
        }
    };


    return (
        <div className="min-h-screen bg-white">
            <Topbar />
            <MainHeader />
            <NavBar activeTab="Contact Us" />

            <PageHero
                eyebrow="Get in touch"
                crumb="Contact Us"
                title={<>Talk to someone who <span className="text-brand">knows the part.</span></>}
                subtitle="Parts enquiry, fitment question, trade account or a delivery update — reach the right desk and get a straight answer, fast."
            />

            <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
                    {/* form */}
                    <div className="rounded-2xl border border-hairline bg-white p-7 sm:p-9">
                        {sent ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-stock-wash">
                                    <CheckCircle2 size={32} className="text-stock" />
                                </span>
                                <h2 className="font-display mt-5 text-2xl font-extrabold tracking-[-0.02em] text-carbon">
                                    Message sent
                                </h2>
                                <p className="mt-2 max-w-sm text-sm text-faint">
                                    Thanks for reaching out. A specialist will get back to you within one business day.
                                    We&apos;ve emailed you a copy — your reference is <span className="font-mono font-semibold text-carbon">{sent}</span>.
                                </p>
                                <button
                                    onClick={() => setSent(null)}
                                    className="mt-6 rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold text-carbon hover:border-brand hover:text-brand"
                                >
                                    Send another
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="eyebrow">Send a message</span>
                                <h2 className="font-display mt-2 text-[26px] font-extrabold tracking-[-0.02em] text-carbon">
                                    How can we help?
                                </h2>
                                <form className="mt-6" onSubmit={submit}>
                                    {error && <AuthError>{error}</AuthError>}
                                    {/* honeypot: hidden from people and screen readers, bots fill it in */}
                                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                                        <label htmlFor="c-website">Website</label>
                                        <input id="c-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelCls} htmlFor="c-name">Full name</label>
                                            <input id="c-name" required minLength={2} maxLength={100} autoComplete="name" className={fieldCls} placeholder="Your name" value={form.name} onChange={set("name")} />
                                        </div>
                                        <div>
                                            <label className={labelCls} htmlFor="c-phone">Phone <span className="font-normal text-faint">(optional)</span></label>
                                            <input id="c-phone" type="tel" maxLength={20} autoComplete="tel" className={fieldCls} placeholder="0712 345 678" value={form.phone} onChange={set("phone")} />
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelCls} htmlFor="c-email">Email</label>
                                            <input id="c-email" type="email" required maxLength={160} autoComplete="email" className={fieldCls} placeholder="you@email.com" value={form.email} onChange={set("email")} />
                                        </div>
                                        <div>
                                            <label className={labelCls} htmlFor="c-topic">Topic</label>
                                            <select id="c-topic" className={`${fieldCls} appearance-none`} value={form.topic} onChange={set("topic")}>
                                                {CONTACT_TOPICS.map((t) => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {needsOrder && (
                                        <div className="mt-4">
                                            <label className={labelCls} htmlFor="c-order">Order number <span className="font-normal text-faint">(if you have one)</span></label>
                                            <input id="c-order" maxLength={40} className={`${fieldCls} font-mono`} placeholder="GNS-20260925-1234" value={form.orderNumber} onChange={set("orderNumber")} />
                                        </div>
                                    )}
                                    <div className="mt-4">
                                        <label className={labelCls} htmlFor="c-msg">Message</label>
                                        <textarea
                                            id="c-msg"
                                            required
                                            minLength={10}
                                            maxLength={3000}
                                            rows={5}
                                            value={form.message}
                                            onChange={set("message")}
                                            className="w-full resize-y rounded-lg border border-line-strong bg-white px-3.5 py-3 text-sm text-carbon outline-none focus:border-brand"
                                            placeholder="Tell us the make, model and part you need…"
                                        />
                                    </div>
                                    <div className="mt-5 flex flex-wrap items-center gap-4">
                                        <button
                                            type="submit"
                                            disabled={busy}
                                            className="flex h-[50px] w-full items-center justify-center gap-2.5 rounded-xl bg-brand font-semibold text-white transition hover:bg-brand-hover disabled:opacity-60 sm:w-auto sm:px-8"
                                        >
                                            {busy ? <><Loader2 size={17} className="animate-spin" /> Sending…</> : <><Send size={17} /> Send message</>}
                                        </button>
                                        <p className="text-[12px] text-faint">
                                            We use your details only to reply — see our <Link href="/privacy" className="underline underline-offset-2 hover:text-carbon">Privacy Policy</Link>.
                                        </p>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>

                    {/* info column */}
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {infos.map((c) => (
                                <div key={c.label} className="rounded-2xl border border-hairline bg-white p-5">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-wash">
                                        <c.icon size={19} className="text-brand" />
                                    </span>
                                    <div className="mt-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink">
                                        {c.label}
                                    </div>
                                    {c.lines.map((l) => (
                                        <div key={l} className="mt-1 text-[13.5px] text-carbon break-words">{l}</div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* hours */}
                        <div className="rounded-2xl border border-hairline bg-carbon p-6 text-white">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-brand" />
                                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">Opening hours</span>
                            </div>
                            <div className="mt-4">
                                {hours.map(([d, t]) => (
                                    <div key={d} className="flex items-center justify-between border-b border-[#262a33] py-2.5 text-sm last:border-b-0">
                                        <span className="text-[#9ba3af]">{d}</span>
                                        <span className="font-semibold text-white tnum">{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* location strip */}
                <div className="mt-8 overflow-hidden rounded-2xl border border-hairline">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr]">
                        <div className="flex flex-col justify-center gap-3 bg-white p-8">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-wash">
                                <Building2 size={20} className="text-brand" />
                            </span>
                            <h3 className="font-display text-xl font-extrabold tracking-[-0.01em] text-carbon">
                                Genesis Investment HQ
                            </h3>
                            <p className="text-[14px] leading-relaxed text-mutedink">
                                Enterprise Road, Industrial Area, Nairobi. Trade counter and warehouse — walk-ins welcome
                                during opening hours, or order online for same-day dispatch.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
                                <MapPin size={15} /> Get directions
                            </div>
                        </div>
                        <div
                            className="relative min-h-[240px] bg-surface"
                            style={{
                                backgroundImage:
                                    "linear-gradient(to right, #e6e9ef 1px, transparent 1px), linear-gradient(to bottom, #e6e9ef 1px, transparent 1px)",
                                backgroundSize: "36px 36px",
                            }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg">
                                        <MapPin size={22} />
                                    </span>
                                    <span className="mt-2 rounded-md bg-carbon px-3 py-1 text-[12px] font-semibold text-white">
                                        Industrial Area, Nairobi
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
