import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BadgeCheck, Truck, PackageSearch } from "lucide-react";
import Logo from "@/components/common/Logo";

const perks = [
    { icon: BadgeCheck, title: "Genuine & OEM only", text: "Every part verified before it ships." },
    { icon: Truck, title: "Fast dispatch", text: "Same-day in Nairobi, countrywide delivery." },
    { icon: PackageSearch, title: "Track every order", text: "Live status from checkout to doorstep." },
];

/** Split-screen shell for the auth pages (login / register / verify). */
export default function AuthShell({
    eyebrow,
    title,
    subtitle,
    children,
    footer,
}: {
    eyebrow?: string;
    title: string;
    subtitle?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-white">
            {/* ── Brand panel ─────────────────────────────── */}
            <aside className="relative hidden w-[46%] max-w-[720px] overflow-hidden bg-carbon lg:flex lg:flex-col">
                <Image src="/hero1.png" alt="" fill preload sizes="46vw" className="object-cover object-[30%_center] opacity-55" />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/70 to-carbon/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-carbon/80 to-transparent" />
                <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-brand/25 blur-[110px]" />

                <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-14">
                    <Link href="/" className="w-fit"><Logo withMark dark /></Link>

                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Kenya&apos;s parts specialists
                        </span>
                        <h2 className="mt-5 max-w-md font-display text-[40px] font-extrabold leading-[1.05] tracking-[-0.03em] text-white xl:text-[46px]">
                            The right part,<br />
                            <span className="text-brand">first time.</span>
                        </h2>
                        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/65">
                            Your garage in your pocket — saved vehicles, wishlists and order history in one account.
                        </p>

                        <ul className="mt-9 space-y-4">
                            {perks.map(({ icon: Icon, title, text }) => (
                                <li key={title} className="flex items-start gap-3.5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-brand backdrop-blur">
                                        <Icon size={19} strokeWidth={2} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{title}</p>
                                        <p className="text-[13px] text-white/55">{text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-xs text-white/40">© {new Date().getFullYear()} Genesis Investment. All rights reserved.</p>
                </div>
            </aside>

            {/* ── Form panel ──────────────────────────────── */}
            <main className="relative flex flex-1 flex-col">
                <div className="flex h-[76px] items-center justify-between px-5 sm:px-10">
                    <Link href="/" className="lg:hidden"><Logo withMark /></Link>
                    <Link href="/" className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-mutedink transition hover:text-carbon">
                        <ArrowLeft size={15} /> Back to shop
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center px-5 pb-14 pt-4 sm:px-10">
                    <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {eyebrow && (
                            <p className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.2em] text-brand-ink">{eyebrow}</p>
                        )}
                        <h1 className="font-display text-[30px] font-extrabold leading-tight tracking-[-0.025em] text-carbon">{title}</h1>
                        {subtitle && <p className="mt-2 text-[14.5px] leading-relaxed text-mutedink">{subtitle}</p>}
                        <div className="mt-8">{children}</div>
                        {footer && (
                            <div className="mt-8 border-t border-line pt-6 text-center text-sm text-mutedink">{footer}</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
