'use client'

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, User, Package, Heart, LogOut, Loader2, BadgeCheck, ChevronRight, MapPin } from "lucide-react";
import Topbar from "@/components/common/Topbar";
import MainHeader from "@/components/common/MainHeader";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/features/auth/AuthContext";

const nav = [
    { href: "/account", label: "Overview", icon: LayoutGrid },
    { href: "/account/orders", label: "Orders", icon: Package },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/profile", label: "Profile & settings", icon: User },
];

export default function AccountShell({ children }: { children: React.ReactNode }) {
    const { user, ready, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (ready && !user) {
            router.replace(`/account/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [ready, user, pathname, router]);

    if (!ready || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white text-faint">
                <Loader2 size={22} className="animate-spin" />
            </div>
        );
    }

    const fullName = user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "My account";
    const initials = ((user.firstName?.[0] ?? user.email?.[0] ?? "U") + (user.lastName?.[0] ?? "")).toUpperCase();
    const isActive = (href: string) => pathname === href || (href !== "/account" && pathname.startsWith(href + "/"));
    const current = nav.find((n) => isActive(n.href))?.label ?? "Account";
    const signOut = () => { logout(); router.replace("/"); };

    return (
        <div className="min-h-screen bg-surface">
            <Topbar />
            <MainHeader />
            <NavBar />

            {/* ── Profile banner ─────────────────────────── */}
            <div className="relative overflow-hidden bg-carbon">
                <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-[100px]" />
                <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:32px_32px]" />
                <div className="relative mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6">
                    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12.5px] text-white/50">
                        <Link href="/" className="transition hover:text-white">Home</Link>
                        <ChevronRight size={13} />
                        <Link href="/account" className="transition hover:text-white">My account</Link>
                        {pathname !== "/account" && <><ChevronRight size={13} /><span className="text-white/80">{current}</span></>}
                    </nav>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
                        <div className="flex min-w-0 items-center gap-4">
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[#b83e12] font-display text-xl font-extrabold text-white shadow-[0_10px_30px_-10px_rgba(228,83,31,0.7)] ring-4 ring-white/10">
                                {initials}
                            </span>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="truncate font-display text-2xl font-extrabold tracking-[-0.02em] text-white sm:text-[28px]">{fullName}</h1>
                                    {user.emailVerified && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/85">
                                            <BadgeCheck size={13} className="text-brand" /> Verified
                                        </span>
                                    )}
                                </div>
                                <p className="truncate text-sm text-white/55">{user.email}</p>
                            </div>
                        </div>
                        <button onClick={signOut}
                            className="hidden items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[13px] font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/5 hover:text-white sm:inline-flex">
                            <LogOut size={15} /> Sign out
                        </button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6">
                <div className="-mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
                    {/* sidebar / mobile tabs */}
                    <aside className="relative h-fit rounded-2xl border border-hairline bg-white p-2 shadow-[0_1px_2px_rgba(20,22,28,.04),0_12px_32px_-20px_rgba(20,22,28,.25)] lg:sticky lg:top-6 lg:p-3">
                        <p className="hidden px-3 pb-2 pt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-faint lg:block">Account</p>
                        <nav className="flex gap-1 overflow-x-auto lg:flex-col [scrollbar-width:none]">
                            {nav.map((n) => {
                                const active = isActive(n.href);
                                return (
                                    <Link
                                        key={n.href}
                                        href={n.href}
                                        aria-current={active ? "page" : undefined}
                                        className={`relative flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition ${active
                                            ? "bg-carbon text-white lg:bg-brand-wash lg:text-brand-ink"
                                            : "text-mutedink hover:bg-surface hover:text-carbon"}`}
                                    >
                                        {active && <span className="absolute inset-y-2 left-0 hidden w-[3px] rounded-r-full bg-brand lg:block" />}
                                        <n.icon size={17} strokeWidth={active ? 2.25 : 2} /> {n.label}
                                    </Link>
                                );
                            })}
                            <div className="my-2 hidden border-t border-line lg:block" />
                            <button onClick={signOut}
                                className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-medium text-mutedink transition hover:bg-[#fdf3f2] hover:text-[#b23b32]">
                                <LogOut size={17} /> Sign out
                            </button>
                        </nav>
                    </aside>

                    <section className="min-w-0 pt-0 lg:pt-5">{children}</section>
                </div>
            </main>

            <Footer />
        </div>
    );
}

/** Consistent title block for each account panel. */
export function PanelHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
                <h2 className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-carbon">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-mutedink">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

export const cardCls = "rounded-2xl border border-hairline bg-white shadow-[0_1px_2px_rgba(20,22,28,.04)]";
