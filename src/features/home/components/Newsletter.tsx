'use client'

import { useState } from "react";
import { Mail, Send, CheckCircle2, Tag, Truck, BellRing } from "lucide-react";

export default function Newsletter() {
    const [done, setDone] = useState(false);

    return (
        <section className="bg-surface">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-16">
                <div className="relative overflow-hidden rounded-3xl bg-carbon px-6 py-12 sm:px-12">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-70"
                        style={{ background: "radial-gradient(circle at 85% 30%, rgba(228,83,31,0.24), transparent 55%)" }}
                    />
                    <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                                <BellRing size={13} /> Stay in the loop
                            </span>
                            <h2 className="font-display mt-5 text-[30px] font-extrabold tracking-[-0.02em] leading-[1.08] text-white sm:text-[34px]">
                                Get deals &amp; new stock alerts first
                            </h2>
                            <p className="mt-3 max-w-md text-[#c7cdd7]">
                                Join 12,000+ drivers and garages. Weekly offers, restock alerts and the odd genuine
                                bargain — no spam, unsubscribe anytime.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-5 text-[13px] text-[#9ba3af]">
                                <span className="flex items-center gap-2"><Tag size={15} className="text-brand" /> Member-only prices</span>
                                <span className="flex items-center gap-2"><Truck size={15} className="text-brand" /> Early restock alerts</span>
                            </div>
                        </div>

                        <div>
                            {done ? (
                                <div className="flex items-center gap-4 rounded-2xl border border-[#2a2e37] bg-[#1d2027] p-6">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stock-wash">
                                        <CheckCircle2 size={26} className="text-stock" />
                                    </span>
                                    <div>
                                        <div className="font-semibold text-white">You&apos;re subscribed</div>
                                        <div className="text-[13px] text-[#9ba3af]">Watch your inbox for this week&apos;s deals.</div>
                                    </div>
                                </div>
                            ) : (
                                <form
                                    onSubmit={(e) => { e.preventDefault(); setDone(true); }}
                                    className="rounded-2xl border border-[#2a2e37] bg-[#1d2027]/70 p-3 backdrop-blur"
                                >
                                    <div className="flex flex-col gap-2.5 sm:flex-row">
                                        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3.5">
                                            <Mail size={17} className="text-faint" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="you@email.com"
                                                aria-label="Email address"
                                                className="h-12 flex-1 bg-transparent text-sm text-carbon outline-none placeholder:text-faint"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-white transition hover:bg-brand-hover"
                                        >
                                            <Send size={16} /> Subscribe
                                        </button>
                                    </div>
                                    <p className="mt-2.5 px-1 text-[11.5px] text-[#6b7280]">
                                        By subscribing you agree to our Privacy Policy.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
